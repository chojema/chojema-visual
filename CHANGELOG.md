# 변경 기록

## 1.1.2 (2026-11-09)

- `LICENSE`를 표준 MIT 문구만 남겨 GitHub이 MIT로 인식하게 했다. 글꼴의 OFL 1.1 안내는 README, `references/sources.md`, `assets/fonts/Pretendard-OFL.txt`에 있다.

## 1.1.1 (2026-11-09)

- HTML 렌더러와 Blender MP4 명령의 색 태그가 FFmpeg 7 이상에서 `unknown`이나 sRGB로 남던 문제를 `setparams`로 고쳤다. 픽셀은 그대로이고 태그만 BT.709로 확정된다.
- 최상위에 `.gitignore`, `.gitattributes`를 추가했다.

## 1.1.0 (2026-11-09)

- 영어 요청도 인식하도록 스킬 설명을 영어로 작성하고 한국어 키워드를 함께 넣었다. 결과물은 요청한 언어로 작성한다.
- Whisper 출력을 편집용 전사문으로 바꾸는 `scripts/whisper-transcript.mjs`를 추가했다.
- 편집 도구에 `--ffmpeg`, `--ffprobe` 옵션을 추가하고, FFmpeg 7 이상에서는 폐기 예정인 `-filter_complex_script` 대신 `-/filter_complex`를 쓴다.
- 발표 자료 견본에서 장을 넘기면 등장 내용이 투명하게 남던 버그를 고쳤다.
- Blender 견본의 재질 색이 렌더에 적용되지 않던 버그와 `World.use_nodes` 폐기 경고를 고치고, 회전 루프를 등속 무이음매로 바꿨다.
- 음량 정규화의 true peak 목표를 AAC 재인코딩 여유를 둔 -1.5로 조정했다.
- 스킬 파일을 개발 기록과 분리된 폴더로 정리하고 MIT 라이선스를 추가했다.
- 테스트를 16개로 늘렸다(전사 변환, HTML 렌더러, Blender 견본, FFmpeg 경로 지정 포함).

## 1.0.0 (2026-11-08)

- 최초 버전.
