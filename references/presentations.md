# 발표 자료와 모션 그래픽

PowerPoint의 단독 시각 요소, 스마트아트, 도형, 그래픽, 데이터 차트, 애니메이션과 전환은 [PowerPoint 시각 요소](powerpoint.md)를 먼저 읽는다. 이 문서는 여러 장의 구성, HTML 발표 자료와 기존 XML 애니메이션 예제를 다룬다.

## 결과 형식 선택

기존 발표 자료를 수정하면 그 형식과 제작 도구를 유지한다. 새 자료에서 형식 지정이 없고 움직임과 직접 재생이 핵심이면 HTML 발표 자료를 기본으로 삼는다. 편집 가능한 `.pptx`, PDF, 발표 녹화 영상이 지정되면 그 형식으로 만든다. HTML을 제공하고 PowerPoint를 완성했다고 표현하지 않는다.

한 장의 수정에는 그 장과 연결된 상태만 확인한다. 새 여러 장의 자료는 청중이 이해해야 할 메시지와 장 순서를 정하고, 한 장에 하나의 주장을 둔다. 광고의 행동 유도 문구나 고정된 15초 길이를 발표 자료에 강제하지 않는다.

## HTML 발표 자료

[slides.html](../assets/slides.html)을 복사해 문구와 시각 요소를 바꾼다. 자산을 복사할 때 글꼴과 라이선스의 상대 경로를 유지한다. 견본은 키보드와 버튼으로 탐색하고 자동으로 장을 넘기지 않는다. 발표자가 멈추고 설명할 수 있게 한다.

- 이동, 마스크, 강조는 내용의 순서와 관계를 설명하는 데 쓴다. 계속 움직이는 배경이나 장식으로 읽기를 방해하지 않는다.
- 키보드 탐색, 보이는 포커스, 숨긴 장의 포커스 차단, 모션 감소 설정, 인쇄 레이아웃을 유지한다. 클릭해야 보이는 핵심 내용은 인쇄와 정지 출력에도 나타나게 한다.
- 화면 비율과 발표 화면에서 글자 크기, 표와 차트의 레이블, 넘침을 확인한다. 통계와 인용문에는 해당 출처를 표시한다.
- 외부 자산은 가능하면 로컬로 고정한다. 영상과 소리를 넣으면 재생, 일시 정지와 탐색 상태를 함께 관리한다. 사용자 조작 없는 유음 자동 재생에 의존하지 않는다.

견본의 `window.renderSlide(index, progress)`는 0부터 시작하는 장 번호와 0~1의 등장 진행률을 받는다. 클릭할 때마다 등장하는 항목 등으로 확장하면 장과 단계 상태를 명시한다. 정지 캡처는 `progress=1`을 사용한다. HTML 영상용 `window.renderFrame` 계약과 다른 인터페이스이며 `render-html.mjs`에 그대로 넣지 않는다.

## PowerPoint와 기타 출력

사용 가능한 발표 자료 편집 도구가 있으면 원본 도형과 텍스트를 편집 가능한 형태로 유지한다. PowerPoint 자체 자동화, 파일 생성 도구와 지원 한계는 [제작 경로 선택](powerpoint.md#제작-경로-선택)을 따른다. 실제 도구가 지원하는 애니메이션과 전환을 사용하고 재생 결과를 확인한다. HTML 효과를 네이티브 PowerPoint 애니메이션으로 자동 변환할 수 있다고 가정하지 않는다.

도구가 없거나 요청한 기능을 지원하지 않으면 해당 한계를 알리고, 제공 가능한 형식을 구분한다. PDF나 장별 이미지는 정지 결과이며 애니메이션 납품물이 아니다. 발표 영상은 별도 시간표와 내레이션에 맞춰 만들고 필요할 때만 영상 제작과 오디오 지침을 읽는다.

### python-pptx로 만들 때

- 움직일 대상은 그림보다 PowerPoint 도형이나 도형 그룹으로 만들어 편집할 수 있게 둔다. 여러 도형을 함께 움직이면 `slide.shapes.add_group_shape()`로 묶고 그룹에 애니메이션을 건다. 글꼴은 받는 컴퓨터에 있는 글꼴을 쓰거나, 없을 수 있음을 알린다.
- python-pptx에는 애니메이션 API가 없다. 슬라이드 XML에 `p:timing`을 하나 넣는다. 위치는 `p:clrMapOvr`와 `p:transition` 뒤, `p:extLst` 앞이다. 대상은 도형의 `shape_id`(`spid`)로 가리키고, `cTn`의 `id`는 슬라이드 안에서 겹치지 않는 증가하는 정수로 둔다.
- 이동 경로(`p:animMotion`)는 시작 위치 기준 상대 좌표이며 단위는 슬라이드 너비와 높이의 비율이다. 오른쪽으로 `dx` EMU 이동은 `M 0 0 L {dx / slide_width} 0 E`이다. 회전(`p:animRot`)의 `by`는 각도 × 60000이며 양수가 시계 방향이다.
- 굴러가는 물체는 회전각을 이동 거리 ÷ (π × 지름) × 360으로 계산하고, 이동과 회전의 지연, 길이, 가감속을 같게 둔다. 다르면 미끄러져 보인다.
- 첫 효과를 슬라이드 시작과 함께 자동 재생하려면 아래처럼 바깥 `p:par`에 `delay="indefinite"`와 `onBegin` 조건을 두고 `nodeType="afterEffect"`를 쓴다. 클릭으로 시작하려면 `onBegin` 조건을 빼고 `nodeType="clickEffect"`를 쓴다. 같은 시점에 함께 시작하는 효과는 `withEffect`로 둔다.

아래 예시는 원 하나를 슬라이드 왼쪽 끝에서 오른쪽 끝까지 굴린다. 검증한 효과는 사용자 지정 이동 경로(`presetClass="path"`, `presetID="0"`)와 회전(`presetClass="emph"`, `presetID="8"`)이다. 다른 효과를 쓰면 PowerPoint에서 같은 효과를 하나 만들어 저장한 XML과 비교한다.

```python
import math
from lxml import etree
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from pptx.util import Inches

P = "http://schemas.openxmlformats.org/presentationml/2006/main"

def add_roll(slide, shape, slide_width, dx, diameter, delay_ms=500, dur_ms=3000):
    """Move `shape` right by dx EMU while spinning it as if rolling; starts automatically."""
    path_x = dx / slide_width
    by = round(dx / (math.pi * diameter) * 360 * 60000)
    spid = shape.shape_id
    timing = etree.fromstring(f"""
<p:timing xmlns:p="{P}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>
<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>
 <p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>
  <p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>
   <p:par><p:cTn id="5" presetID="0" presetClass="path" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="{delay_ms}"/></p:stCondLst><p:childTnLst>
    <p:animMotion origin="layout" path="M 0 0 L {path_x:.6f} 0 E" pathEditMode="relative" rAng="0" ptsTypes="AA"><p:cBhvr><p:cTn id="6" dur="{dur_ms}" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>ppt_x</p:attrName><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr><p:rCtr x="{int(path_x * 50000)}" y="0"/></p:animMotion>
   </p:childTnLst></p:cTn></p:par>
   <p:par><p:cTn id="7" presetID="8" presetClass="emph" presetSubtype="0" fill="hold" nodeType="withEffect"><p:stCondLst><p:cond delay="{delay_ms}"/></p:stCondLst><p:childTnLst>
    <p:animRot by="{by}"><p:cBhvr><p:cTn id="8" dur="{dur_ms}" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>r</p:attrName></p:attrNameLst></p:cBhvr></p:animRot>
   </p:childTnLst></p:cTn></p:par>
  </p:childTnLst></p:cTn></p:par>
 </p:childTnLst></p:cTn></p:par>
</p:childTnLst></p:cTn>
<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>
<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>
</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>""")
    ext = slide._element.find(qn("p:extLst"))
    ext.addprevious(timing) if ext is not None else slide._element.append(timing)

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
slide = prs.slides.add_slide(prs.slide_layouts[6])
d = Inches(1.4)
ball = slide.shapes.add_shape(MSO_SHAPE.OVAL, 0, Inches(4.5), d, d)
add_roll(slide, ball, prs.slide_width, prs.slide_width - d, d)
prs.save("roll.pptx")
```

### PowerPoint로 재생 확인

PowerPoint가 있는 Windows에서는 COM으로 파일을 읽기 전용으로 열어 애니메이션 목록을 확인하고, 영상으로 내보내 실제 재생을 본다. 효과 종류 번호는 0이 사용자 지정 경로, 61이 회전이고, 시작 방식은 1이 클릭, 2가 이전 효과와 함께, 3이 이전 효과 다음이다.

```powershell
$app = New-Object -ComObject PowerPoint.Application
try {
  $pres = $app.Presentations.Open((Resolve-Path "roll.pptx").Path, $true, $false, $false)
  $seq = $pres.Slides(1).TimeLine.MainSequence
  for ($i = 1; $i -le $seq.Count; $i++) { $e = $seq.Item($i); "$($e.Shape.Name) type=$($e.EffectType) trigger=$($e.Timing.TriggerType) dur=$($e.Timing.Duration)" }
  $pres.CreateVideo("$PWD\roll-preview.mp4", $true, 5, 720, 30, 85)
  while ($pres.CreateVideoStatus -in 1, 2) { Start-Sleep -Milliseconds 500 }
  "video status $($pres.CreateVideoStatus)"  # 3 = done
  $pres.Close()
} finally { $app.Quit() }
```

내보낸 영상에서 시작, 중간, 끝 프레임을 뽑아 위치와 회전을 확인한다. 기존 영상 경로가 있으면 새 이름을 쓴다. PowerPoint가 없으면 XML 구조만 확인한 것이므로 재생은 미검증으로 알린다. LibreOffice Impress는 일부 효과를 다르게 재생하므로 PowerPoint 재생의 근거로 쓰지 않는다.

### 공통 확인

전체 화면, 키보드 탐색, 앞뒤 이동, 각 장의 안정된 상태와 움직이는 상태를 확인한다. 마지막 장에서 멈추는지, 모션 감소 환경과 인쇄에서도 내용이 보이는지 확인한다.

공식 자료: [python-pptx](https://python-pptx.readthedocs.io/), [PowerPoint 애니메이션 개체 모델](https://learn.microsoft.com/en-us/office/vba/api/powerpoint.timeline), [모션 감소 설정](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [인쇄 스타일](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Printing).
