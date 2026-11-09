---
name: chojema-visual
description: Creates or edits visual content using only the production modules a request needs - Blender 3D modeling, materials, lighting, still renders and 3D animation; 2D motion graphics, kinetic typography and HTML/SVG/Canvas scenes rendered to MP4; product ads and app demo videos; music-synced brand showreels; footage editing (trims, silence and mistake removal from transcripts, Whisper transcription, subtitles, compositing, audio mix and loudness); and animated HTML slide decks or PowerPoint (.pptx) files with native animations. Use for anything from a single model, shot or slide fix to multi-scene productions, whether the request is in English or Korean (블렌더, 3D 애니메이션, 모션 그래픽, 제품 영상, 앱 시연, 쇼릴, 영상 편집, 무음 제거, 자막, 발표 자료, 파워포인트).
license: MIT (see LICENSE; bundled Pretendard, Gowun Batang and Gowun Dodum fonts are OFL-1.1)
metadata:
  author: Chojema
  version: "1.3.1"
---

# Chojema Visual

> Language: these instructions are written in Korean but apply to requests in any language. Reply, write captions, slide copy and file notes in the user's language unless they ask otherwise.

하나의 스킬에서 요청의 종류와 규모에 맞는 기능만 사용한다. 작은 작업은 바로 만들고 확인한다. 긴 영상의 제작 절차를 단독 모델링이나 한 장의 수정에 적용하지 않는다.

## 작업 선택

사용자가 지정한 원본, 프로젝트, 결과 형식과 완료 범위를 먼저 확인한다. 기존 프로젝트는 그 엔진과 구조를 유지한다. 아래에서 이번 작업에 필요한 문서만 읽는다. 폴더 전체 읽기, 모든 모듈 선행 로드, 전체 자산 열람을 하지 않는다. 문서의 작은 목차로 필요한 절을 골라 읽어도 된다.

| 요청 | 처음 읽을 문서 | 필요한 경우에만 추가 |
| --- | --- | --- |
| Blender 모델, 재질, 조명, 정지 이미지, 3D 애니메이션 | [3D 제작](references/blender.md) | 영상 합성은 편집, 소리가 필요하면 오디오 |
| 글자나 도형의 움직임, 2D 장면 | [2D 모션](references/motion.md) | MP4 출력은 렌더링 |
| 제품 광고, 앱 시연 | [제품 영상](references/product-film.md) | 사용하는 엔진의 제작 지침 |
| 브랜드 쇼릴, 음악 박자에 맞춘 영상 | [모션 쇼릴](references/showreel.md) | 사용하는 엔진의 제작 지침, 오디오 |
| 자르기, 전사, 무음 제거, 실수 편집, 자막, 촬영본 합성 | [영상 편집](references/editing.md) | 새 장면이 필요할 때만 2D나 3D |
| 모션 그래픽이 있는 발표 자료, PowerPoint 파일과 애니메이션 | [발표 자료](references/presentations.md) | 별도 3D 자산이 필요할 때만 3D |

## 실행 범위

- **단독 작업:** 요청한 요소를 수정하거나 만들고 해당 결과만 확인한다. 브리프, 스토리보드, 음향, 전체 렌더를 의무화하지 않는다.
- **여러 장면:** 사용할 자산, 규격, 장면 시간과 연결을 프로젝트에 짧게 기록한다. 필요할 때 [스토리보드](assets/storyboard-template.md)를 쓴다.
- **복합 제작:** 실제로 쓰는 모듈만 연결한다. 화면 비율, fps, 프레임 범위, 자산 경로를 공유하고, 편집 후에는 그 결과의 시간표로 자막과 소리를 맞춘다. 한 프로젝트와 최종 결과물로 묶는다.
- 사용자가 검토를 지정했으면 해당 단계에서 검토받는다. 완성까지 맡긴 작업은 주어진 범위 안에서 계속한다. 단순한 수정에 새 인터뷰나 반복 승인을 추가하지 않는다.

## 공통 제작 기준

- 원본을 보존하고 별도 결과 경로에 저장한다. 사용자 프로젝트를 스킬 폴더에 만들지 않는다. 자산은 기존 프로젝트나 지정된 자료에서 필요한 것만 확인한다. 실제 UI, 로고, 제품 형상과 수치를 근거 없이 만들어 사실처럼 제시하지 않는다.
- 결과 형식은 요청을 따른다. `.blend`, 정지 이미지, HTML 발표 자료처럼 영상이 아닌 결과도 완성본이다. HTML 발표 자료와 편집 가능한 PowerPoint, 녹화된 발표 영상은 서로 다른 납품물이다.
- 필요한 실행 파일과 의존성만 확인한다. Blender 단독 작업에 Node.js나 HyperFrames를 설치하지 않는다. 다른 전문 스킬의 추가 설치를 요구하지 않는다. 외부 서비스 사용, 업로드와 유료 생성은 기존 사용자 승인 범위를 따른다.
- 한국어 글꼴은 기본으로 Pretendard를 쓰고, 제목·인용·감성 문구에는 Gowun Batang, 따뜻한 본문과 자막에는 Gowun Dodum을 고를 수 있다. 굵기, 선언 예시와 라이선스 고지 규칙은 [실행 환경과 자료 출처](references/sources.md)의 한국어 글꼴 절을 따른다.
- 결과를 실제로 열거나 렌더해 작업에 맞게 확인한다. 정지 작업은 해당 화면, 애니메이션은 동작과 전환, 편집본은 경계와 싱크, 발표 자료는 탐색과 가독성을 확인한다. 수행하지 못한 검증은 구분해 알린다.

## 조건부 공통 자료

- [렌더링](references/rendering.md): 새 로컬 HTML의 프레임 출력, 화면 녹화 삽입, MP4 내보내기. 기존 HyperFrames/GSAP 프로젝트는 [2D 모션](references/motion.md)의 해당 절을 사용한다.
- [오디오](references/audio.md): 소리를 요청했거나 영상에 필요할 때만 읽는다. 무음 작업에 음악이나 내레이션을 추가하지 않는다.
- [실행 환경과 자료 출처](references/sources.md): 실행 조건, 도구 검사와 글꼴 사용 조건을 확인할 때만 읽는다. 견본과 글꼴은 결과물 제작에 쓸 파일이며 지침처럼 모두 읽지 않는다.
