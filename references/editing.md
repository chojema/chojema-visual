# 촬영본 편집

## 작은 편집

자르기, 크기 조정, 자막 한 곳 수정은 기존 편집기나 FFmpeg로 해당 작업만 한다. 전사와 무음 제거, 새 모션 장면을 자동으로 추가하지 않는다. 원본을 보존하고 새 출력 경로를 사용한다.

편집 전 필요한 스트림, 길이, fps와 해상도를 확인한다.

```text
ffprobe -v error -show_entries format=duration:stream=index,codec_type,codec_name,width,height,avg_frame_rate -of json source.mp4
```

무음 영상이나 오디오 전용 파일에는 아래의 A/V 동시 편집 도구를 쓰지 않는다. 해당 스트림에 맞는 편집 방법을 사용한다. 단순 복사 자르기는 키프레임 오차가 생길 수 있으므로 정확한 경계가 필요하면 재인코딩한다.

## 전사와 시간 기준

있는 전사문을 재사용한다. 없으면 사용 가능한 로컬 전사 도구를 우선 검토하고, 선택한 서비스의 전송과 비용은 승인 범위를 따른다. 문장 단위 시간을 임의로 쪼개 단어 시각으로 만들지 않는다. 전사가 없으면 파형과 재생으로 구간을 정해 편집할 수 있다.

로컬 Whisper 결과는 `whisper-transcript.mjs`로 아래 형식으로 바꾼다. FFmpeg `whisper` 필터의 `format=json` 출력, whisper.cpp의 `-oj` JSON, `segments`(단어 시각이 있으면 단어 우선)나 `words` 배열의 초 단위 JSON을 받는다. 겹치는 구간은 앞 구간 끝으로, 영상 길이를 넘는 끝은 영상 길이로 자른다. 구간 단위 결과는 구간 사이 무음 편집과 자막 시점에는 충분하지만, 구간 안의 실수 편집은 재생으로 경계를 확인한다.

```text
ffmpeg -i source.mp4 -vn -af "whisper=model=<ggml 모델 경로>:language=auto:format=json:destination=whisper.jsonl" -f null -
node "<skill>/scripts/whisper-transcript.mjs" whisper.jsonl --media source.mp4 --out transcript.json
```

FFmpeg 필터 인자 안에서는 Windows 드라이브의 콜론을 `C\\:/models/ggml-base.bin`처럼 이스케이프한다. 필터가 없으면 `ffmpeg -hide_banner -filters`로 확인하고 whisper.cpp나 다른 로컬 전사 도구의 JSON을 사용한다.

포함된 전사 기반 도구는 다음 형식을 사용한다. 시간은 입력 영상의 초이며, `audio_duration_secs`는 FFprobe로 확인한 실제 길이와 맞춘다. `words`는 시간순이고 `0 <= start < end <= duration`을 만족해야 한다.

```json
{"audio_duration_secs":8,"words":[{"text":"안녕하세요.","start":1,"end":2},{"text":"시작합니다.","start":4,"end":5}]}
```

## 무음과 실수 편집

`<skill>`은 스킬 폴더이며 출력은 새 작업 하위 폴더로 둔다. 먼저 계획을 만들고 내용을 확인한다. 사용자가 편집 완성까지 맡겼으면 문맥 검토 후 진행하며, 별도 검토를 지정한 구간만 기다린다.

```text
node "<skill>/scripts/cut-silences.mjs" transcript.json --video source.mp4 --out-dir work/silence-plan
```

이 도구는 `--gap`(기본 0.55초) 이상인 단어 사이 간격만 줄이며, 그보다 짧은 간격은 그대로 둔다. 줄인 간격은 0.2초를 남기고 양쪽에 같은 숨 쉴 여유를 둔다. `--gap`이 0.2초보다 짧으면 그 길이를 남긴다. 발화 전후 대기는 `--head-pad`(0.22초), `--tail-pad`(0.34초)만 남긴다. 대화 교대, 강조를 위한 침묵, 음악과 시연 대기 시간을 단어 간 공백만 보고 삭제하지 않는다. 적절하면 새 출력 경로와 새 메타데이터 폴더로 실제 편집한다.

```text
node "<skill>/scripts/cut-silences.mjs" transcript.json --video source.mp4 --out-dir work/silence-render --output silence-v1.mp4 --apply
```

실수, 반복, 재촬영은 문맥과 음성을 확인해 삭제 구간을 작성한다. 의도적인 반복을 말더듬으로 단정하지 않는다. 무음 편집 다음에 작업하면 편집본과 재배치된 전사문을 짝으로 사용한다. 단어를 가르는 삭제 구간은 자막을 다시 작성해야 하므로 먼저 경계를 검토한다.

```json
{"cuts":[{"start":1.2,"end":2.1,"reason":"다시 말한 문장의 앞 테이크"}]}
```

```text
node "<skill>/scripts/apply-cuts.mjs" current-transcript.json --cuts cuts.json --video current.mp4 --out-dir work/cuts-plan
node "<skill>/scripts/apply-cuts.mjs" current-transcript.json --cuts cuts.json --video current.mp4 --out-dir work/cuts-render --output clean-v1.mp4 --apply
```

도구는 편집 결정 목록(EDL), 새 시간 기준의 전사문, 편집 계획을 만든다. `--apply`가 있을 때만 FFmpeg로 영상을 만들고, 생성 여부는 `video.rendered`로 확인한다. 기존 출력은 덮어쓰지 않으므로 재시도는 새 경로에서 한다. FFmpeg나 FFprobe가 PATH에 없으면 `--ffmpeg <경로>`, `--ffprobe <경로>`를 지정한다. `whisper-transcript.mjs`도 `--ffprobe`를 받는다.

## 자막과 장면 연결

마지막 편집본의 시간표로 자막을 만든다. 여러 번 편집한 경우 각 EDL과 그 입력 파일을 보존해 원본으로 추적할 수 있게 한다. 기존 자막을 원본 시간으로 그대로 붙이지 않는다.

보조 영상과 그래픽은 설명하는 문장에 연결한다. 새 장면이 필요할 때만 [2D 모션](motion.md)이나 [Blender](blender.md)를 읽는다. 합성 전에 화면 비율, fps, 해상도와 색을 맞춘다. 음성이 있는 구간에서는 배경음을 낮추고 [오디오](audio.md)로 필요한 합성만 한다.

모든 삭제 경계의 앞뒤를 듣고 재생한다. 말의 의미, 호흡, 검은 프레임, 얼굴 크롭, 자막과 음성 싱크를 확인한다. 최종 MP4와 요청한 원본 프로젝트, 자막, 편집 내역을 제공한다.

공식 자료: [FFmpeg 필터](https://ffmpeg.org/ffmpeg-filters.html), [FFprobe](https://ffmpeg.org/ffprobe.html).
