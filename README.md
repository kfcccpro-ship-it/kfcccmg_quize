# 🏦 새마을금고 퀴즈 대결 앱

> 새마을금고법 기반 신입직원 교육용 실시간 퀴즈 배틀 시스템

---

## 🚀 배포 방법 (GitHub + Render — 무료, 추천!)

### ① GitHub에 올리기

1. https://github.com 가입 후 로그인
2. 우측 상단 `+` → `New repository`
3. Repository name: `kmg-quiz` 입력 → `Create repository`
4. 아래 명령어로 업로드 (터미널/명령프롬프트):

```bash
cd kmg-quiz
git init
git add .
git commit -m "새마을금고 퀴즈 대결 앱"
git remote add origin https://github.com/내아이디/kmg-quiz.git
git push -u origin main
```

---

### ② Render로 무료 배포

1. https://render.com 가입 (GitHub 계정으로 바로 가입 가능)
2. `New +` → `Web Service` 클릭
3. GitHub 연결 → `kmg-quiz` 저장소 선택
4. 아래 설정 입력:

| 항목 | 값 |
|------|-----|
| Name | kmg-quiz |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |

5. `Create Web Service` 클릭
6. 2~3분 후 URL 발급: `https://kmg-quiz.onrender.com`
7. 이 URL을 참가자 70명에게 공유! 🎉

> ⚠️ Render 무료 플랜은 15분 비활성 시 절전 모드 진입 → 첫 접속 시 30초 대기 발생  
> 교육 시작 전 미리 한 번 접속해 깨워두세요!

---

## 💻 로컬 실행 방법 (같은 와이파이 환경)

```bash
# Node.js 설치 필요 → https://nodejs.org
npm install
npm start
```
터미널에 표시된 `http://192.168.x.x:3000` 주소를 참가자에게 공유

---

## 🎮 게임 방법

| 단계 | 내용 |
|------|------|
| 1 | 이름 + 팀 번호 입력 → 고유 번호 발급 |
| 2 | 직접 만나서 상대방 번호 확인 |
| 3 | "대결 신청" → 상대방 번호 입력 |
| 4 | 상대방 수락 → 🎲 랜덤 문제 유형 공개! |
| 5 | 6초 이내 먼저 맞추면 승점 |
| 6 | 5문제 3선승제 |

---

## 🎲 랜덤 문제 유형

대결 시작 시 자동 랜덤 결정 — 아무도 미리 알 수 없습니다!

| 섹터 | 유형 | 문제 수 |
|------|------|---------|
| 1 | ⭕ OX 퀴즈 | 30문제 |
| 2 | 3️⃣ 3지 선다 | 25문제 |
| 3 | 4️⃣ 4지 선다 | 25문제 |

---

## 🏆 수상 기준

### 팀상
| 수상 | 기준 |
|------|------|
| 팀 승률왕 | 팀원 평균 승률 1위 팀 |
| 팀 정답왕 | 팀원 정답 합계 1위 팀 |
| 팀 열정왕 | 팀원 대결 수 합계 1위 팀 |

### 개인상
| 수상 | 기준 |
|------|------|
| 개인 대결왕 | 가장 많이 대결한 사람 |
| 개인 정답왕 | 가장 많이 맞춘 사람 |
| 개인 승률왕 | 승률이 가장 높은 사람 |

---

## 🔐 관리자

- 비밀번호: **2026**
- 기능: 참가 현황 확인, 점수 초기화, 전체 초기화
