# Demo Scenario

## Scenario 1. General Object Mode 성공

1. `HomeScreen`에서 `Create Alarm`을 누른다.
2. `General Object Mode`를 선택한다.
3. `bottle`, `cup`, `book` 등 일반 객체를 선택한다.
4. alarm card를 누르고 `Start Test`를 선택한다.
5. `AlarmRingingScreen`에서 target object를 확인한다.
6. `Open Camera`를 누르고 target object를 촬영한다.
7. `Submit for Recognition`을 누른다.
8. `ResultScreen`에서 `Recognition succeeded`와 `Processing time`을 확인한다.

## Scenario 2. General Object Mode 실패

1. `General Object Mode` alarm test를 시작한다.
2. target object와 다른 물체를 촬영하거나 target object가 잘 보이지 않게 촬영한다.
3. `ResultScreen`에서 `Recognition failed`를 확인한다.
4. `Top prediction`, `Matched target label`, `Required confidence threshold`를 확인한다.
5. `Retake Photo`를 눌러 다시 촬영한다.

실패 예시로 `toothbrush`는 ImageNet pretrained model이 `spindle`, `hammer`, `ballpoint` 등으로 예측하여 실패한 사례가 있다.

## Scenario 3. Custom Object Mode 성공

1. `Register Custom Object`에서 object ID를 입력한다.
2. 같은 물체를 최소 5장 이상 촬영한다.
3. `Create Alarm`에서 `Custom Object Mode`를 선택한다.
4. 등록된 custom object를 선택한다.
5. alarm card menu에서 `Start Test`를 선택한다.
6. 같은 물체를 촬영한다.
7. `ResultScreen`에서 `Similarity`, `Required similarity threshold`, `Processing time`, `Result`를 확인한다.

## Scenario 4. Custom Object Mode 실패

1. custom alarm test를 시작한다.
2. 등록한 물체와 다른 물체를 촬영하거나 조명이 매우 어두운 상태에서 촬영한다.
3. similarity가 threshold보다 낮으면 실패한다.
4. `Retake Photo`로 다시 촬영한다.

실험에서 `Custom Object Mode`의 일부 `cup`, `laptop`, `mouse` trial은 similarity가 0.88 threshold 아래로 내려가 실패하였다.

## Scenario 5. 저조도 결과 확인

1. 일반 조명 `On`에서 같은 object를 촬영한다.
2. 저조도 `Low`에서 같은 object를 촬영한다.
3. `Processing time`과 success/failure를 비교한다.
4. 저조도에서는 처리 시간보다 similarity와 success rate 변화가 더 중요하게 관찰되었다.
