// src/components/wydawnictwo/editionScene.ts
import * as THREE from "three";
import type { EditionPage } from "@/lib/edition-pages";
import { framesFor, sheetCount, spreadAt } from "@/lib/spread";

/**
 * Scena książki - czysty moduł imperatywny, BEZ REACTA.
 *
 * React nie może renderować 60 razy na sekundę, a scena musi. Dlatego całość
 * żyje tutaj i wystawia dwie funkcje: `goTo` i `dispose`. Dzięki temu warstwę
 * widoku da się wymienić bez dotykania geometrii, a geometrię bez dotykania
 * dostępności.
 */

/** Ile stopni zwinięcia osiąga kartka w połowie obrotu. Przy 1.35 kartka
 * czytała się jak sztywna deska - prawdziwy papier zwija się przy wolnej
 * krawędzi znacznie mocniej. */
const BEND_MAX = 1.95;
/** Skręt wierszowy - róg prowadzi obrót po przekątnej, jak w prawdziwej książce. */
const LEAD = 0.32;
/** Ile zwinięcie unosi kartkę nad blat. */
const LIFT = 0.5;
/** Podział siatki. Mniej niż 32 kolumny i zwinięcie widać jako łamaną. */
const SEG_X = 40;
// Skręt zmienia się LINIOWO po wysokości strony, więc gęsty podział w pionie
// nic nie wnosił poza kosztem: 18 rzędów to było 931 wierzchołków na klatkę,
// 10 rzędów daje 451 przy nieodróżnialnym wyglądzie.
const SEG_Y = 10;

/** Odcień papieru tam, gdzie nie ma tekstury - biel byłaby zimna i płaska. */
const PAPER_TINT = 0xf5f2ea;

/** Czas pełnego obrotu kartki (ms) i dolna granica dla obrotów częściowych. */
const FLIP_MS = 820;
const MIN_FLIP_MS = 180;

/**
 * Krzywa obrotu kartki.
 *
 * Poprzednio kartka jechała wykładniczym dociągiem `tv += (cel - tv) * 0.12`.
 * Miał dwie wady: ruszał z maksymalną prędkością (papier tak się nie zachowuje -
 * kartkę trzeba najpierw podważyć) i zależał od liczby klatek, więc na ekranie
 * 120 Hz obrót leciał dwa razy szybciej niż na 60 Hz. Tu postęp liczy się
 * z CZASU, a krzywa rozpędza i wyhamowuje symetrycznie.
 */
const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export interface SceneHandle {
  /** Przejdź do stanu `o` (liczba arkuszy po lewej), animując obrót. */
  goTo(o: number): void;
  dispose(): void;
}

export function createScene(
  canvas: HTMLCanvasElement,
  pages: EditionPage[],
  opts: { reduced: boolean; onSettled: (o: number) => void },
): SceneHandle {
  const aspect = pages[0].width / pages[0].height;
  const PW = 1; // szerokość strony w jednostkach sceny
  const PH = PW / aspect;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Strony to niemal biały papier, czyli materiał o albedo bliskim 1. Przy
  // domyślnej ekspozycji i mocnym świetle kluczowym ACES ścinał je do bieli
  // i śliwkowa okładka Debiutów wychodziła szara. Ekspozycja poniżej jedynki
  // zostawia zapas na jasnych polach, więc kolor okładki wraca.
  renderer.toneMappingExposure = 0.92;

  // Cienie to najdroższy element sceny. Na wąskich ekranach wyłączamy je
  // zamiast pozwolić, żeby całość się zacinała.
  const wantShadows = window.innerWidth >= 900 && !opts.reduced;
  renderer.shadowMap.enabled = wantShadows;
  // VSM, nie PCFSoftShadowMap: ten drugi jest w tej wersji three przestarzały
  // i po cichu podmieniany na zwykły PCF, więc „miękkie" cienie wychodziły
  // twarde - obracana kartka rzucała na stronę czarną plamę z ostrą krawędzią.
  // VSM naprawdę rozmywa, sterowany przez radius i blurSamples niżej.
  renderer.shadowMap.type = THREE.VSMShadowMap;
  // Odświeżaniem mapy cienia sterujemy sami, z `draw()`. Domyślnie three
  // przeliczałby ją przy każdym renderze, razem z rozmyciem VSM.
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  // Wąski kąt widzenia z większej odległości zamiast szerokiego z bliska.
  // Poprzedni obiektyw (32° z 3 jednostek) ścinał strony w mocny trapez i druk
  // robił się nieczytelny przy dalszej krawędzi. Te same proporcje kadru przy
  // 24° z 4 jednostek dają obraz bliższy rzutowi prostokątnemu: strona czyta
  // się jak strona, a nie jak klin.
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  /** Kierunek patrzenia jest stały; dobieramy tylko odległość. */
  const VIEW_DIR = new THREE.Vector3(0, 3.35, 2.05).normalize();
  /** Ile kadru zostaje na margines - 1.0 znaczyłoby „książka po same krawędzie". */
  const FIT = 0.84;
  let camDist = 4;
  const sonda = new THREE.Vector3();

  const applyCam = () => {
    camera.position.copy(VIEW_DIR).multiplyScalar(camDist);
    camera.lookAt(0, 0, 0);
  };

  /**
   * Odległość kamery, przy której treść o danej połówkowej szerokości mieści
   * się w kadrze.
   *
   * Wcześniej kamera stała w ustalonym punkcie dobranym pod szeroki ekran.
   * Na wąskim, pionowym płótnie telefonu ten sam punkt przycinał książkę przy
   * bocznych krawędziach, a użytkownik nie ma jak się oddalić. Odległość liczy
   * się teraz z RZUTU punktów skrajnych, więc kadr dopasowuje się sam: im
   * węższe płótno, tym dalej stoi kamera.
   *
   * Szerokość jest parametrem, a nie stałą, bo na okładce widać JEDNĄ stronę,
   * a nie rozkładówkę. Dopasowanie do pełnych dwóch stron zostawiałoby wtedy
   * pół kadru pustki i okładka byłaby niepotrzebnie mała.
   */
  const fitDistance = (halfW: number): number => {
    const punkty = [
      new THREE.Vector3(-halfW, 0, -PH / 2),
      new THREE.Vector3(halfW, 0, -PH / 2),
      new THREE.Vector3(-halfW, 0, PH / 2),
      new THREE.Vector3(halfW, 0, PH / 2),
      new THREE.Vector3(0, PW * 0.62, 0), // szczyt uniesionej kartki
    ];
    let d = 4;
    for (let i = 0; i < 8; i++) {
      camera.position.copy(VIEW_DIR).multiplyScalar(d);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      let worst = 0;
      for (const p of punkty) {
        sonda.copy(p).project(camera);
        worst = Math.max(worst, Math.abs(sonda.x), Math.abs(sonda.y));
      }
      if (worst < 1e-6) break;
      const skala = worst / FIT;
      d *= skala;
      if (Math.abs(skala - 1) < 0.002) break;
    }
    return d;
  };

  // Światło kluczowe zeszło z 2.4: przy papierze o albedo bliskim 1 tamta moc
  // wypłukiwała druk razem z kolorem okładki.
  const key = new THREE.DirectionalLight(0xfff1dd, 1.25);
  key.position.set(1.6, 3.0, 1.4);
  key.castShadow = wantShadows;
  // VSM rozmywa mapę cienia OSOBNYM przebiegiem w każdej klatce, a koszt rośnie
  // z rozmiarem mapy i liczbą próbek. Przy 2048 i 24 próbkach scena dławiła się
  // tak, że pojedyncza klatka nie wyrabiała się w sekundach. 1024 i 8 próbek
  // daje to samo miękkie wrażenie przy koszcie, który urządzenie udźwignie.
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 4;
  key.shadow.blurSamples = 8;
  // Ciasny stożek cienia wokół samej książki. Domyślny obejmuje o wiele większy
  // obszar, więc mapa cienia marnowała rozdzielczość na pustą podłogę i
  // krawędzie schodkowały się nawet po rozmyciu.
  key.shadow.camera.left = -2.2;
  key.shadow.camera.right = 2.2;
  key.shadow.camera.top = 2.2;
  key.shadow.camera.bottom = -2.2;
  scene.add(key);
  // Światło wypełniające podniesione względem klucza: cień ma być obecny, ale
  // nie czarny. To ono decyduje, jak głęboka jest plama pod obracaną kartką.
  // Delikatne światło z przeciwnej strony, BEZ cienia. Rewers obracanej kartki
  // odwraca się od klucza i przy samym wypełnieniu wychodził martwo szary,
  // choć to ta sama biała kartka co reszta. To światło przywraca mu papier.
  const fill = new THREE.DirectionalLight(0xe8efff, 0.55);
  fill.position.set(-1.9, 1.6, -1.1);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x14161c, 0.62));
  scene.add(new THREE.AmbientLight(0xffffff, 0.34));

  const groundGeo = new THREE.PlaneGeometry(14, 14);
  // ShadowMaterial rysuje TYLKO cień, sam pozostając przezroczysty. Wcześniej
  // pod książką leżała widoczna szara płyta i cień kładł się na niej twardą
  // krawędzią - wyglądało to jak scena testowa, a nie jak książka. Teraz przez
  // podłogę widać tło nakładki, a zostaje sam miękki cień pod tomem.
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.34 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = wantShadows;
  scene.add(ground);

  let disposed = false;
  let raf = 0;
  // Czy od ostatniego rysowania cokolwiek się zmieniło. Bez tego pętla rAF
  // rysowała scenę 60 razy na sekundę także wtedy, gdy książka nieruchomo
  // leżała otwarta - razem z pełnym rozmyciem mapy cienia.
  let dirty = true;

  /**
   * Jedno miejsce, które decyduje o narysowaniu klatki poza pętlą.
   *
   * Przy zredukowanym ruchu pętli rAF nie ma, a `TextureLoader.load` jest
   * asynchroniczne: jedyny render wypadłby PRZED dojściem obrazów i użytkownik
   * zobaczyłby biały prostokąt. To błąd dostępności, nie kosmetyka - więc każda
   * doładowana tekstura prosi tu o render. Gdy pętla działa (`raf !== 0`),
   * następna klatka i tak narysuje scenę, więc drugi render byłby marnotrawstwem.
   */
  const requestRender = () => {
    if (disposed) return;
    dirty = true;
    if (raf !== 0) return; // pętla i tak narysuje najbliższą klatkę
    draw();
  };

  const draw = () => {
    // Mapa cienia przelicza się TYLKO razem z klatką, która czegoś nowego
    // dotyczy. Domyślnie three odświeżałby ją co klatkę - łącznie z rozmyciem
    // VSM - także wtedy, gdy książka nieruchomo leży otwarta.
    if (wantShadows) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    dirty = false;
  };

  /**
   * Tekstura zastępcza 1×1. Trzyma zdefiniowany `USE_MAP` w materiale kartki
   * NAWET zanim dojdzie pierwsza strona - bez `map` three.js nie deklaruje
   * `vMapUv`, a nasza wstrzyknięta gałąź na `gl_FrontFacing` się do niego
   * odwołuje i shader nie skompilowałby się w ogóle.
   */
  const blank = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  blank.needsUpdate = true;

  // Tekstury ładujemy leniwie - 130 stron naraz to kilkanaście megabajtów
  // w pamięci karty graficznej bez żadnego powodu.
  const loader = new THREE.TextureLoader();
  const cache = new Map<number, THREE.Texture>();
  const texture = (i: number | null): THREE.Texture | null => {
    if (i === null || i < 0 || i >= pages.length) return null;
    let t = cache.get(i);
    if (!t) {
      t = loader.load(pages[i].src, requestRender);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      cache.set(i, t);
    }
    return t;
  };

  const paper = (map: THREE.Texture | null) =>
    new THREE.MeshStandardMaterial({
      map,
      color: map ? 0xffffff : PAPER_TINT,
      roughness: 0.82,
      side: THREE.DoubleSide,
    });

  // Materiały statycznych stron są TRWAŁE. Tworzenie nowego przy każdym obrocie
  // zostawiałoby po sobie program shadera i bufory, których nikt nie zwalnia -
  // przy 130 stronach to setki wyciekniętych materiałów na jedną sesję.
  const leftMat = paper(null);
  const rightMat = paper(null);

  /**
   * Wszystko, co jest książką, siedzi we wspólnej grupie.
   *
   * Grupa przesuwa się w poziomie, żeby WIDOCZNA treść zawsze była na środku
   * kadru. Na okładce istnieje tylko prawa strona, więc bez tego tom wisiałby
   * w prawej połowie ekranu z pustką obok. Przesunięcie jedzie tą samą krzywą
   * co obrót, więc otwarcie książki wygląda jak jeden ruch, a nie jak skok.
   */
  const book = new THREE.Group();
  scene.add(book);

  const flat = (x: number, material: THREE.MeshStandardMaterial) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), material);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0, 0);
    m.receiveShadow = wantShadows;
    book.add(m);
    return m;
  };
  const leftPage = flat(-PW / 2, leftMat);
  const rightPage = flat(PW / 2, rightMat);

  /**
   * Podmiana strony na trwałym materiale.
   *
   * `USE_MAP` zależy od tego, CZY tekstura jest - nie od tego, KTÓRA. Rekompilacji
   * shadera żądamy więc wyłącznie przy przejściu tekstura↔pustka, bo wymuszanie
   * jej co obrót powodowałoby zacięcie na każdej przewracanej kartce.
   */
  const setFace = (
    mesh: THREE.Mesh,
    material: THREE.MeshStandardMaterial,
    index: number | null,
  ) => {
    const t = texture(index);
    if ((material.map === null) !== (t === null)) material.needsUpdate = true;
    material.map = t;
    material.color.setHex(t ? 0xffffff : PAPER_TINT);
    mesh.visible = t !== null;
  };

  // Kartka w ruchu. Geometria jest współdzielona i deformowana co klatkę,
  // więc zapamiętujemy pozycje spoczynkowe - inaczej deformacja narastałaby.
  const leafGeo = new THREE.PlaneGeometry(PW, PH, SEG_X, SEG_Y);
  const rest = Float32Array.from(leafGeo.attributes.position.array);
  const leafMat = paper(blank);

  /**
   * Rewers kartki pokazuje INNĄ stronę niż awers. Gałąź na `gl_FrontFacing`
   * w jednym materiale zamiast dwóch siatek: dwie siatki w tej samej
   * płaszczyźnie migotałyby (z-fighting), a tak zostaje jedna, która poprawnie
   * się oświetla i rzuca jeden cień.
   *
   * Uniform jest TRWAŁY i żyje poza `onBeforeCompile`, bo ten callback odpala
   * się dopiero przy pierwszej kompilacji materiału - czyli przy pierwszym
   * renderze widocznej kartki, a więc PO pierwszym `startFlip`. Gdyby uniform
   * powstawał w środku, pierwsze przewrócenie ustawiałoby tył na obiekcie,
   * którego jeszcze nie ma, i rewers byłby bez tekstury.
   */
  const backUniform: { value: THREE.Texture | null } = { value: blank };
  leafMat.onBeforeCompile = (shader) => {
    shader.uniforms.backMap = backUniform;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D backMap;")
      .replace(
        "#include <map_fragment>",
        `
        vec4 sampledDiffuseColor;
        if (gl_FrontFacing) {
          sampledDiffuseColor = texture2D(map, vMapUv);
        } else {
          // Odbicie U, żeby tył nie był lustrzany.
          sampledDiffuseColor = texture2D(backMap, vec2(1.0 - vMapUv.x, vMapUv.y));
        }
        diffuseColor *= sampledDiffuseColor;
        `,
      );
  };

  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.castShadow = wantShadows;
  // Kartka musi leżeć tak samo jak strony statyczne. Obrót -PI/2 wokół X
  // odwzorowuje lokalne (x, y, z) na światowe (x, z, -y): wysokość strony
  // idzie w -Z (zgodnie ze stronami statycznymi), a zwinięcie z `deform`
  // unosi się w +Y, czyli nad blat. Przesunięcie stawia grzbiet geometrii
  // (lokalne x = -PW/2) dokładnie w x = 0, więc w spoczynku kartka
  // pokrywa prawą stronę, a po obrocie - lewą.
  leaf.rotation.x = -Math.PI / 2;
  leaf.position.x = PW / 2;
  leaf.visible = false;
  book.add(leaf);

  let o = 0;
  let tv = 0;
  // Stan obrotu trzymamy JAWNIE, zamiast wyprowadzać kierunek z porównania
  // `target > o`. Przy przeciąganiu cel potrafi się zrównać ze stanem bieżącym
  // (kartka puszczona przed połową wraca tam, skąd wyszła) i takie porównanie
  // nie odróżniłoby powrotu z obrotu w przód od powrotu z obrotu w tył.
  let flipGoal = 0; // dokąd zmierza `tv`
  let flipDest = 0; // jakie `o` obowiązuje po wylądowaniu
  let flipFrom = 0; // `tv` w chwili startu animacji
  let flipStart = 0; // znacznik czasu startu
  let offsetFrom = 0; // przesunięcie książki na starcie animacji
  let offsetTo = 0; // i po jej zakończeniu
  let distFrom = 0; // odległość kamery na starcie animacji
  let distTo = 0; // i po jej zakończeniu
  let dragging = false;

  /**
   * Rozpoczyna odliczanie animacji od bieżącego położenia kartki.
   *
   * Wołane i przy sterowaniu (klawiatura, przyciski, kółko), i przy puszczeniu
   * przeciąganej kartki - w tym drugim przypadku start nie jest ani w zerze,
   * ani w jedynce, tylko tam, gdzie palec zostawił kartkę.
   */
  const beginFlip = () => {
    flipFrom = tv;
    flipStart = performance.now();
    offsetFrom = book.position.x;
    offsetTo = offsetFor(flipDest);
    distFrom = camDist;
    distTo = fitDistance(halfWidthFor(flipDest));
  };

  /**
   * O ile przesunąć książkę, żeby widoczna treść wypadła na środku kadru.
   *
   * Okładka i ostatnia strona stoją same - wtedy środek treści leży o pół
   * strony od grzbietu i trzeba go ściągnąć na oś kamery.
   */
  const offsetFor = (state: number): number => {
    const { verso, recto } = spreadAt(state, pages.length);
    if (verso === null && recto !== null) return -PW / 2;
    if (verso !== null && recto === null) return PW / 2;
    return 0;
  };

  /**
   * Połówkowa szerokość WIDOCZNEJ treści: pełna strona przy rozkładówce,
   * pół strony, gdy widać tylko okładkę albo ostatnią stronę.
   */
  const halfWidthFor = (state: number): number => {
    const { verso, recto } = spreadAt(state, pages.length);
    return verso !== null && recto !== null ? PW : PW / 2;
  };

  const paintStatics = (state: number) => {
    const { verso, recto } = spreadAt(state, pages.length);
    setFace(leftPage, leftMat, verso);
    setFace(rightPage, rightMat, recto);
    book.position.x = offsetFor(state);
    camDist = fitDistance(halfWidthFor(state));
    applyCam();
  };

  /**
   * Wczytuje z wyprzedzeniem strony, które wejdą do gry przy NAJBLIŻSZYM
   * obrocie - w przód i w tył.
   *
   * Bez tego pierwsza klatka obrotu musiała poczekać na pobranie i zdekodowanie
   * WebP oraz wysłanie tekstury na kartę graficzną. Zacięcie wypadało dokładnie
   * w chwili ruszania kartki, czyli w najgorszym możliwym miejscu.
   */
  const prewarm = (state: number) => {
    const naprzod = framesFor(state, pages.length);
    texture(naprzod.leafFront);
    texture(naprzod.leafBack);
    texture(naprzod.staticRecto);
    if (state > 0) {
      const wstecz = framesFor(state - 1, pages.length);
      texture(wstecz.leafFront);
      texture(wstecz.leafBack);
      texture(wstecz.staticVerso);
    }
  };

  /**
   * Deformacja kartki dla postępu `t ∈ [0,1]`.
   *
   * Wierzchołek w odległości `s` od grzbietu owija walec o promieniu
   * `ρ = PW / bend`, a potem obraca się o `theta` wokół grzbietu.
   * `bend = sin(t·π)` sprawia, że zwinięcie narasta do połowy obrotu i opada -
   * bez tego kartka byłaby sztywną płytą.
   */
  const deform = (t: number) => {
    const pos = leafGeo.attributes.position;
    const nor = leafGeo.attributes.normal;
    const theta = t * Math.PI;
    const sinTheta = Math.sin(theta);
    const bend = Math.max(0.0001, sinTheta * BEND_MAX);
    const rho = PW / bend;
    // Skręt wierszowy WYGASA na obu końcach obrotu (mnożnik sin(theta)).
    // Wcześniej działał także przy theta = 0 i przy theta = pi, więc kartka
    // w tych skrajnych położeniach nie pokrywała się z płaską stroną statyczną,
    // tylko była lekko wachlarzowo skręcona. Skutek: widoczne szarpnięcie
    // w chwili pojawienia się kartki i drugie przy jej zniknięciu - dokładnie
    // tam, gdzie ruch ma być niewidoczny.
    const k = (LEAD * sinTheta) / PH; // pochodna skrętu po wysokości strony

    for (let i = 0; i < pos.count; i++) {
      const x0 = rest[i * 3];
      const y0 = rest[i * 3 + 1];
      const s = x0 + PW / 2; // odległość od grzbietu, 0..PW

      const a = (s / PW) * bend;
      const sinA = Math.sin(a);
      const cosA = Math.cos(a);
      const cx = rho * sinA;
      const cy = rho * (1 - cosA);

      const twist = theta + LEAD * (y0 / PH) * sinTheta;
      const c = Math.cos(twist);
      const sn = Math.sin(twist);

      pos.setXYZ(i, -PW / 2 + cx * c, y0, cx * sn + cy * LIFT);

      // Normalne liczone WPROST z pochodnych powierzchni, zamiast przez
      // computeVertexNormals(). Tamto przechodziło co klatkę po wszystkich
      // ścianach, sumowało normalne sąsiadów i normalizowało - najdroższa
      // pojedyncza operacja w pętli. Tu mamy postać parametryczną, więc
      // normalna jest iloczynem wektorowym stycznych i wychodzi dokładniejsza.
      const asx = cosA * c;
      const asz = cosA * sn + sinA * LIFT;
      const bxx = -cx * sn * k;
      const bzz = cx * c * k;
      const nx = -asz;
      const ny = asz * bxx - asx * bzz;
      const nz = asx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nor.setXYZ(i, nx / len, ny / len, nz / len);
    }
    pos.needsUpdate = true;
    nor.needsUpdate = true;
  };

  const startFlip = (from: number, to: number) => {
    const base = Math.min(from, to);
    const f = framesFor(base, pages.length);
    setFace(leftPage, leftMat, f.staticVerso);
    setFace(rightPage, rightMat, f.staticRecto);

    // Awers NIGDY nie może zostać pusty: zniknięcie `map` zabrałoby `USE_MAP`
    // razem z `vMapUv`, na którym stoi gałąź rewersu. Stąd papierowa zastępka.
    leafMat.map = texture(f.leafFront) ?? blank;
    backUniform.value = texture(f.leafBack) ?? blank;
    // Bez `leafMat.needsUpdate`: podmieniamy jedną teksturę na drugą, defines się
    // nie zmieniają, a wymuszona rekompilacja shadera zacinałaby każdy obrót.
    leaf.visible = true;
    // `tv` to POŁOŻENIE kartki, nie postęp względem kierunku: 0 = leży na
    // prawej stronie, 1 = leży na lewej. Obrót w tył startuje więc z jedynki.
    tv = to > from ? 0 : 1;
    flipGoal = to > from ? 1 : 0;
    flipDest = to;
    beginFlip();
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    // Podczas przeciągania kartką steruje wskaźnik. Bez tego wyjścia pętla
    // dociągałaby `tv` do celu w tej samej klatce, w której ustawia je palec,
    // i kartka wyrywałaby się spod niego.
    if (leaf.visible && !dragging) {
      const span = Math.abs(flipGoal - flipFrom);
      // Krótsza droga trwa krócej. Kartka puszczona tuż przed celem nie ma
      // powodu lecieć tyle samo, co przewracana od samego początku.
      const dur = Math.max(MIN_FLIP_MS, FLIP_MS * span);
      const p = span === 0 ? 1 : Math.min(1, (now - flipStart) / dur);
      const e = easeInOut(p);
      tv = flipFrom + (flipGoal - flipFrom) * e;
      // Kadr równoważy się tą samą krzywą, więc otwarcie tomu to jeden ruch.
      book.position.x = offsetFrom + (offsetTo - offsetFrom) * e;
      // Kamera odjeżdża razem z otwieraniem tomu: z jednej strony na dwie.
      camDist = distFrom + (distTo - distFrom) * e;
      applyCam();
      deform(tv);
      dirty = true;
      if (p >= 1) {
        leaf.visible = false;
        o = flipDest;
        paintStatics(o);
        prewarm(o);
        opts.onSettled(o);
      }
    }
    if (dirty) draw();
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    // Płótno jeszcze nieułożone albo kontener chwilowo ukryty: `w / h` dałoby
    // Infinity lub NaN i zepsułoby macierz projekcji na stałe.
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Dopasowanie MUSI być po ustawieniu proporcji: to od nich zależy, jak
    // daleko trzeba się cofnąć, żeby książka zmieściła się na szerokość.
    camDist = fitDistance(halfWidthFor(o));
    applyCam();
    requestRender();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  paintStatics(0);
  prewarm(0);
  if (!opts.reduced) raf = requestAnimationFrame(tick);
  else draw();

  /**
   * Przeciąganie: czubek kartki idzie za palcem.
   *
   * Rzutujemy wskaźnik na płaszczyznę książki i mapujemy jego X na położenie
   * kartki przez `acos(x/PW)/pi`. To NIE jest odwzorowanie liniowe i tak ma
   * być: kartka porusza się po łuku, więc równomierny ruch palca daje
   * równomierny ruch kartki, a nie przyspieszenie na środku.
   */
  const raycaster = new THREE.Raycaster();
  const surface = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  const ndc = new THREE.Vector2();
  /** Kierunek rozpoczętego przeciągnięcia: +1 w przód, -1 w tył. */
  let dragDir = 0;
  /** Stan `o`, na którym wylądujemy, jeśli przeciągnięcie zostanie dokończone. */
  let dragDest = 0;

  const pointerProgress = (e: PointerEvent): number | null => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    if (!raycaster.ray.intersectPlane(surface, hit)) return null;
    const x = Math.max(-PW, Math.min(PW, hit.x));
    return Math.acos(x / PW) / Math.PI;
  };

  const onDown = (e: PointerEvent) => {
    if (opts.reduced || dragging) return;
    if (pointerProgress(e) === null) return;
    // Kierunek zależy od tego, po której stronie grzbietu zaczęto ciągnąć.
    const dir = hit.x > 0 ? 1 : -1;
    const dest = Math.max(0, Math.min(sheetCount(pages.length), o + dir));
    // Na pierwszej i ostatniej rozkładówce nie ma czego przewracać. Bez tego
    // `framesFor` dostałoby ujemny arkusz i kartka byłaby pusta.
    if (dest === o) return;
    dragging = true;
    dragDir = dir;
    dragDest = dest;
    canvas.setPointerCapture(e.pointerId);
    startFlip(o, dest);
  };

  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const p = pointerProgress(e);
    if (p === null) return;
    tv = Math.max(0, Math.min(1, p));
    // Kadr jedzie za palcem razem z kartką - inaczej książka stałaby w miejscu
    // przez całe przeciągnięcie i doskoczyła dopiero po puszczeniu.
    const prog = dragDir === 1 ? tv : 1 - tv;
    book.position.x = offsetFrom + (offsetTo - offsetFrom) * prog;
    camDist = distFrom + (distTo - distFrom) * prog;
    applyCam();
    deform(tv);
    dirty = true;
  };

  const onUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    canvas.releasePointerCapture(e.pointerId);
    // Kartka przeciągnięta za połowę dochodzi do końca, puszczona przed -
    // wraca. „Za połowę" zależy od kierunku, bo `tv` to położenie kartki:
    // przy obrocie w tył ruch idzie od jedynki w dół.
    const commit = dragDir === 1 ? tv > 0.5 : tv < 0.5;
    if (dragDir === 1) flipGoal = commit ? 1 : 0;
    else flipGoal = commit ? 0 : 1;
    flipDest = commit ? dragDest : o;
    // Animacja startuje TAM, gdzie palec zostawił kartkę, a nie od zera.
    beginFlip();
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  /**
   * Kółko myszy. Blokada na czas obrotu jest konieczna: jeden ruch trackpada
   * generuje kilkadziesiąt zdarzeń i bez niej książka przeskakiwałaby
   * o kilkanaście stron naraz.
   */
  let wheelReadyAt = 0;
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (opts.reduced || dragging) return;
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 8) return;

    // Blokada trwa TYLE, CO OBRÓT, a nie ustalone 240 ms.
    //
    // Wersja z krótkim `setTimeout` działała wyłącznie przez przypadek: dopóki
    // scena dławiła główny wątek, callback zwalniający blokadę spóźniał się
    // wielokrotnie i gest mieścił się w jednym oknie. Gdy scena przyspieszyła,
    // blokada zaczęła zwalniać się punktualnie i jeden ruch trackpada
    // przewracał trzy kartki. Jeden gest ma dawać jedną kartkę niezależnie od
    // tego, jak szybka jest maszyna - więc odmierzamy to obrotem, nie zegarem
    // dobranym pod obciążenie.
    const teraz = performance.now();
    if (leaf.visible || teraz < wheelReadyAt) return;
    wheelReadyAt = teraz + FLIP_MS + 160;

    handle.goTo(o + (d > 0 ? 1 : -1));
  };
  canvas.addEventListener("wheel", onWheel, { passive: false });

  const handle: SceneHandle = {
    goTo(next: number) {
      const clamped = Math.max(0, Math.min(sheetCount(pages.length), next));
      if (clamped === o) return;
      if (opts.reduced) {
        o = clamped;
        flipDest = clamped;
        paintStatics(o);
        prewarm(o);
        draw();
        opts.onSettled(o);
        return;
      }
      startFlip(o, clamped);
    },
    dispose() {
      disposed = true;
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
      ro.disconnect();
      cache.forEach((t) => t.dispose());
      blank.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      leftPage.geometry.dispose();
      rightPage.geometry.dispose();
      leftMat.dispose();
      rightMat.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      renderer.dispose();
    },
  };
  return handle;
}
