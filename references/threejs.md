# three.js 3D 장면

HTML 장면, 제품 영상, 발표 자료에 넣는 가벼운 실시간 3D를 three.js로 만든다. 회전하는 로고, 제품 턴테이블, 3D 차트와 파티클, 카메라 이동이 대상이다. 실사 재질, 정밀한 그림자와 반사, 복잡한 장면, `.blend` 납품은 [3D 제작](blender.md)을 쓴다. 이미 React Three Fiber나 다른 three.js 구조가 있는 프로젝트는 그 구조와 버전을 유지하고 아래의 결정적 렌더 규칙만 적용한다.

## 라이브러리 준비

three.js는 프로젝트 안의 로컬 파일로 읽는다. [렌더러](rendering.md)는 오프라인으로 실행하므로 CDN 주소는 렌더에서 실패한다. 기존 Node 프로젝트는 `npm install three`를 쓰고, 그 밖에는 패키지의 `build/three.module.min.js`와 실제로 쓰는 `examples/jsm` 파일을 `vendor/three/`에 같은 상대 구조로 복사한다. 애드온은 `../utils/` 등 다른 애드온을 가져오므로 해당 파일도 함께 둔다. three.js의 MIT `LICENSE`를 같은 폴더에 넣고 버전을 고정한다.

```html
<script type="importmap">
{ "imports": { "three": "./vendor/three/build/three.module.min.js",
               "three/addons/": "./vendor/three/examples/jsm/" } }
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
</script>
```

## 결정적 렌더 계약

[렌더링](rendering.md)의 장면 계약을 그대로 따른다. 3D에서는 다음을 추가로 지킨다.

- 카메라, 물체, 조명, 재질 값을 모두 시간 `t = frame / fps`의 함수로 계산한다. `mesh.rotation.y += 0.01` 같은 누적 변형과 `THREE.Clock`, `getDelta()`는 프레임 출력에 쓰지 않는다. 임의의 프레임을 어떤 순서로 불러도 같은 화면이어야 한다.
- glTF 애니메이션은 `mixer.update(delta)` 대신 `mixer.setTime(t)`로 위치를 정한다. 물리 시뮬레이션은 미리 계산한 프레임별 값을 읽는다.
- 무작위 배치는 시드 고정 난수로 한 번만 만든다. `Math.random()`을 그리기 함수 안에서 부르지 않는다.
- `new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })`, `renderer.setPixelRatio(1)`, `renderer.outputColorSpace = THREE.SRGBColorSpace`를 쓴다. 크기는 `innerWidth`, `innerHeight`에 맞춘다.
- 모델과 텍스처 읽기를 하나의 Promise로 모으고 `renderFrame`에서 기다린 뒤 그린다. 읽기 실패는 예외로 알린다.
- 미리보기는 `window.__CHOJEMA_RENDER__`가 거짓일 때만 `renderer.setAnimationLoop`로 같은 그리기 함수를 부른다. `OrbitControls` 같은 조작은 미리보기 전용으로 두고 렌더 때 만들지 않는다.

```js
const ready = Promise.all([loadGLB('model.glb')]).then(([gltf]) => scene.add(gltf.scene));
function draw(t) {
  camera.position.set(Math.sin(t * 0.8) * 4, 1.2, Math.cos(t * 0.8) * 4);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
window.renderFrame = async (frame, fps) => { await ready; draw(frame / fps); };
if (!window.__CHOJEMA_RENDER__) {
  const start = performance.now();
  ready.then(() => renderer.setAnimationLoop(() => draw((performance.now() - start) / 1000)));
}
```

## 로컬 모델 읽기

렌더러는 `file://`의 ES 모듈과 XHR 읽기를 허용한다. `fetch`는 `file://`에서 허용되지 않으므로 `GLTFLoader.load()`와 `FileLoader`는 실패한다. 모델은 텍스처를 담은 단일 `.glb`로 두고 XHR로 읽어 `parse`에 넘긴다. `TextureLoader`는 이미지 요소를 쓰므로 그대로 읽힌다.

```js
function loadGLB(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => (xhr.status === 0 || xhr.status === 200) && xhr.response
      ? new GLTFLoader().parse(xhr.response, '', resolve, reject)
      : reject(new Error(`Could not load ${url}`));
    xhr.onerror = () => reject(new Error(`Could not load ${url}`));
    xhr.send();
  });
}
```

일반 브라우저는 파일을 두 번 눌러 연 페이지의 ES 모듈을 막는다. 사람이 미리볼 때는 프로젝트 폴더에서 `python -m http.server`처럼 로컬 서버로 연다. HTML 자체를 납품하면 받는 쪽에도 로컬 서버가 필요하다는 점을 알리거나, 프로젝트에 이미 있는 번들러로 한 파일에 묶는다.

## Blender 모델 가져오기

Blender에서 만든 모델은 glTF 2.0 바이너리(`.glb`)로 내보낸다. 재질은 Principled BSDF 기준으로 만들고 절차적 노드 텍스처는 이미지로 굽는다. glTF는 Y축이 위이고 Blender 내보내기가 축을 자동으로 바꾼다. 애니메이션은 액션 단위로 넘어가므로 three.js에서 이름으로 고른다.

```text
blender -b scene.blend --python-expr "import bpy; bpy.ops.export_scene.gltf(filepath='model.glb', export_format='GLB', export_apply=True, export_cameras=True)"
```

- `export_apply=True`가 없으면 베벨 같은 수정자가 빠진 원래 형상이 나간다. 카메라와 조명은 기본으로 내보내지 않는다. Blender 구도를 그대로 쓰려면 `export_cameras=True`로 내보내고 `gltf.cameras[0]`의 `aspect`를 화면 비율로 바꾼 뒤 `updateProjectionMatrix()`를 부른다.
- glTF에는 면 조명(Area)이 없고 그림자, 월드 배경, 렌더 설정도 넘어가지 않는다. 조명과 배경은 three.js에서 다시 만들고, Blender 렌더와 같은 명암을 기대하지 않는다.
- 내보낸 키 시간은 `Blender 프레임 / fps`다. Blender 시작 프레임이 1이면 첫 키가 0이 아니라 `1 / fps`에 있다. 렌더 프레임 번호를 Blender 프레임과 맞추려면 `mixer.setTime((frame + 시작 프레임) / fps)`를 쓴다. 빼먹으면 모든 동작이 한 프레임씩 늦다.

가져온 뒤 같은 프레임을 Blender와 나란히 렌더해 크기, 원점, 자세, 카메라 구도와 재질 색을 비교한다. 형상과 재질 작업 자체는 [3D 제작](blender.md)을 따른다.

## 렌더링과 확인

MP4는 [렌더링](rendering.md)의 `render-html.mjs`로 그대로 출력한다. 렌더러는 WebGL을 소프트웨어(SwiftShader)로 그려 컴퓨터마다 같은 결과를 내는 대신 GPU보다 느리다. 해상도, 안티에일리어싱, 그림자 맵 크기, 후처리가 시간을 크게 늘리므로 최종 크기로 몇 프레임을 먼저 출력해 프레임당 시간을 확인한다.

첫 프레임, 중간, 마지막 프레임을 추출해 모델이 실제로 보이는지, 색과 노출이 맞는지 확인한다. 같은 프레임을 다른 순서로 두 번 출력해 같은지도 본다. 첫 프레임만 비어 있으면 자산을 기다리지 않았거나 그리기가 `renderFrame` 밖에서 일어난 것이다.

## 발표 자료에 넣을 때

[HTML 발표 자료](presentations.md)에서는 해당 장이 보일 때만 `setAnimationLoop`를 켜고 장을 떠나면 `setAnimationLoop(null)`로 끈다. 브라우저의 WebGL 컨텍스트 수에는 한도가 있으므로 여러 장이 3D를 쓰면 캔버스 하나를 옮겨 쓰거나 떠난 장의 렌더러를 `dispose()`한다. 모션 감소 설정에서는 회전을 멈춘 정지 화면을 보여 준다. PowerPoint에는 three.js를 넣을 수 없으므로 MP4나 정지 이미지로 렌더해 삽입한다.

공식 자료: [three.js 설치](https://threejs.org/manual/#en/installation), [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader), [Blender glTF 내보내기](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html).
