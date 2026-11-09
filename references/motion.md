# 2D 모션 제작

## 작은 수정과 단독 장면

기존 파일이면 해당 요소와 그 요소가 차지하는 시간만 수정한다. 새 장면은 요청에 맞는 HTML, SVG, Canvas로 시작한다. 한 문장의 등장 효과에 광고 기획이나 쇼릴 구성은 필요하지 않다.

움직임마다 시작 상태, 도착 상태, 길이와 감속 방식을 정한다. 단어별 마스크 등장, 위치와 크기의 연속 변화, 인과관계가 보이는 클릭 반응을 사용한다. 장면 전환은 물체나 시선을 이어받게 하고, 실제 의미에 맞는 컷도 허용한다. 효과의 개수를 목표로 삼지 않는다.

새 로컬 HTML을 영상으로 출력할 때만 [렌더링](rendering.md)의 `window.renderFrame(frame, fps)` 계약과 `scripts/render-html.mjs`를 사용한다. [demo.html](../assets/demo.html)은 세 장면의 형태 변환과 커서 동작을 담은 수정용 견본이다. 제품과 문구는 가상의 예시다.

## 기존 HyperFrames 또는 GSAP 프로젝트

프로젝트의 패키지와 잠금 파일, 가까운 장면의 구현을 먼저 따른다. 설치된 CLI의 도움말과 현재 공식 문서로 지원 옵션을 확인한다. 프레임 렌더러를 바꾸거나 별도의 HyperFrames 스킬을 설치할 필요는 없다.

- HyperFrames 프로젝트의 구성 속성과 `window.__timelines` 등록 방식을 유지한다. 단일 paused GSAP 타임라인 또는 기존 장면 타임라인을 같은 시간 기준으로 구동한다.
- 누적 난수, 현재 시각, 렌더 중 네트워크 요청에 상태를 맡기지 않는다. 파티클과 HUD도 시간의 함수로 계산한다. 앞뒤로 탐색해 같은 시간에 같은 화면이 나오는지 확인한다.
- 변환과 투명도 중심으로 움직인다. 레이아웃 측정은 초기화 때 하고 프레임마다 다시 재지 않는다. 공유 레이어의 상태가 역방향 탐색에서 남으면 프레임 함수에서 계산한다.
- 카탈로그나 외부 카드의 CSS는 해당 장면으로 범위를 좁힌다. 글꼴, 이미지, 라이브러리를 프로젝트에 고정하고 재배포 조건을 보존한다.
- HyperFrames의 영상 레이어는 해당 버전의 미디어 처리 방식을 따른다. 로컬 HTML 렌더러의 이미지 시퀀스 규칙을 HyperFrames 전체에 강제하지 않는다. HyperFrames의 타임라인 파일도 로컬 `render-html.mjs`에 그대로 넘기지 않는다.

기존 프로젝트에서 제공하는 명령을 우선 사용한다. 아래는 HyperFrames 프로젝트에서 사용하는 일반적인 확인 순서이며, 옵션은 설치 버전에서 확인한다.

```text
npx hyperframes lint
npx hyperframes preview
npx hyperframes render --quality draft --output renders/draft.mp4
```

최종 출력 경로가 이미 있으면 새 이름을 사용한다. 전환 경계, 마지막 프레임, 글자 잘림과 글꼴 대체를 확인한다. 변경이 한 장면이면 해당 구간부터 검토하고, 전체 영상은 납품 전에 확인한다.

공식 자료: [HyperFrames](https://github.com/heygen-com/hyperframes), [GSAP 타임라인](https://gsap.com/docs/v3/GSAP/Timeline/).
