# Dustin Apps

`codersongpro` 계정에서 배포된 공개 웹 앱을 자동으로 모아 보여주는 페이지입니다. 새 앱을 배포하면 별도 코드 수정 없이 최대 1시간 안에 목록에 자동 반영됩니다.

## 앱 등록 방법

1. 앱 저장소를 GitHub에 공개로 게시합니다.
2. 저장소의 `Description`에 간단한 소개를 입력합니다.
3. 저장소의 `Website`에 배포 주소를 입력합니다.

`Website`가 등록된 공개 저장소는 최대 1시간 안에 목록에 반영됩니다. 비공개 저장소, 보관된 저장소, 포크 저장소, 올바르지 않은 웹 주소는 표시하지 않습니다.

## 개인정보 보호

페이지는 앱 이름, 저장소 설명, 배포 주소, 최근 수정 시각만 사용합니다. GitHub 저장소 주소를 포함해 이메일, 실명, 위치, 프로필 사진, 커밋 작성자, 팔로워 정보는 화면에 노출하지 않습니다. GitHub 인증 토큰과 별도 데이터베이스도 사용하지 않습니다.

## 로컬 실행

```powershell
npm.cmd install
npm.cmd run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 검증

```powershell
npm.cmd run test:run
npm.cmd run lint
npm.cmd run build
```

## 배포

Vercel Production에 배포하며 목표 주소는 `https://dustin.vercel.app`입니다. GitHub 응답은 1시간 동안 캐시한 뒤 자동 갱신됩니다.
