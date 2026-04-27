const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = '2026';
const QUESTION_TIME_MS = 6000;

// ===== 퀴즈 DB =====
const QUIZ_DB = {
  1: [
    { q:"새마을금고의 주무 감독관청은 행정안전부이다.", opts:["O","X"], ans:"O", exp:"새마을금고는 행정안전부장관의 지도·감독을 받습니다." },
    { q:"새마을금고는 영리를 목적으로 하는 법인이다.", opts:["O","X"], ans:"X", exp:"새마을금고는 비영리법인입니다." },
    { q:"피성년후견인은 새마을금고 회원이 될 수 없다.", opts:["O","X"], ans:"O", exp:"피성년후견인은 새마을금고 회원 자격이 없습니다." },
    { q:"새마을금고법은 1983년 1월 1일 법률 제3622호로 제정되었다.", opts:["O","X"], ans:"O", exp:"새마을금고법은 1983년 1월 1일 법률 제3622호로 제정되었습니다." },
    { q:"회원의 출자금에는 질권을 설정할 수 없다.", opts:["O","X"], ans:"O", exp:"새마을금고법은 출자금에 대한 질권 설정을 금지합니다." },
    { q:"새마을금고 설립은 허가주의를 채택하고 있다.", opts:["O","X"], ans:"X", exp:"새마을금고는 허가주의가 아닌 인가주의를 채택합니다." },
    { q:"파산선고를 받은 자는 새마을금고 회원에서 당연 탈퇴된다.", opts:["O","X"], ans:"O", exp:"파산선고는 당연 탈퇴 사유입니다." },
    { q:"새마을금고 감사는 필요 시 임시총회를 소집할 수 있다.", opts:["O","X"], ans:"O", exp:"감사는 임시총회 소집권을 가집니다." },
    { q:"외국인은 새마을금고 회원이 될 수 없다.", opts:["O","X"], ans:"X", exp:"외국인도 자격요건을 갖추면 새마을금고 회원이 될 수 있습니다." },
    { q:"새마을금고의 최고의결기관은 총회이다.", opts:["O","X"], ans:"O", exp:"새마을금고의 최고의결기관은 총회입니다." },
    { q:"이사장은 새마을금고를 대표한다.", opts:["O","X"], ans:"O", exp:"이사장은 새마을금고의 대표자입니다." },
    { q:"새마을금고는 어음할인 업무를 할 수 있다.", opts:["O","X"], ans:"O", exp:"어음할인은 새마을금고의 신용사업에 포함됩니다." },
    { q:"회원이 사망하면 새마을금고에서 당연 탈퇴된다.", opts:["O","X"], ans:"O", exp:"사망은 당연 탈퇴 사유입니다." },
    { q:"새마을금고의 회계연도는 1월 1일부터 12월 31일까지이다.", opts:["O","X"], ans:"O", exp:"새마을금고의 회계연도는 1월 1일부터 12월 31일까지입니다." },
    { q:"새마을금고 설립 시 반드시 창립총회를 개최해야 한다.", opts:["O","X"], ans:"O", exp:"창립총회 개최는 새마을금고 설립절차의 필수 단계입니다." },
    { q:"새마을금고 잉여금 배당에는 출자배당과 이용고배당이 있다.", opts:["O","X"], ans:"O", exp:"잉여금 배당은 출자배당과 이용고배당으로 이루어집니다." },
    { q:"비회원은 새마을금고 사업을 어떤 경우에도 이용할 수 없다.", opts:["O","X"], ans:"X", exp:"비회원도 일정 범위 내에서 새마을금고 사업을 이용할 수 있습니다." },
    { q:"새마을금고 정관변경은 총회의 특별결의로 한다.", opts:["O","X"], ans:"O", exp:"정관변경은 총회의 특별결의 사항입니다." },
    { q:"새마을금고는 사단법인이다.", opts:["O","X"], ans:"O", exp:"새마을금고는 사단법인입니다." },
    { q:"미성년자는 새마을금고 회원이 될 수 없다.", opts:["O","X"], ans:"X", exp:"미성년자도 자격요건을 갖추면 새마을금고 회원이 될 수 있습니다." },
    { q:"새마을금고 임원에는 이사장, 이사, 감사가 있다.", opts:["O","X"], ans:"O", exp:"새마을금고 임원은 이사장, 이사, 감사로 구성됩니다." },
    { q:"회원은 출자금을 타인에게 양도할 수 있다.", opts:["O","X"], ans:"O", exp:"출자금은 타인에게 양도·양수할 수 있습니다." },
    { q:"새마을금고 회원은 1인 1표의 의결권을 가진다.", opts:["O","X"], ans:"O", exp:"새마을금고는 1인 1표 원칙을 채택합니다." },
    { q:"새마을금고는 공제사업을 운영할 수 있다.", opts:["O","X"], ans:"O", exp:"공제사업은 새마을금고의 사업 범위에 포함됩니다." },
    { q:"새마을금고의 합병은 총회 의결 없이 이사회만으로 결정할 수 있다.", opts:["O","X"], ans:"X", exp:"합병은 총회 의결이 필요합니다." },
    { q:"새마을금고중앙회는 금고에 대한 검사권을 가진다.", opts:["O","X"], ans:"O", exp:"중앙회는 금고를 검사할 권한을 가집니다." },
    { q:"새마을금고법은 민법에 대하여 특별법적 지위를 가진다.", opts:["O","X"], ans:"O", exp:"새마을금고법은 민법에 대해 특별법입니다." },
    { q:"새마을금고의 해산은 이사장이 단독으로 결정할 수 있다.", opts:["O","X"], ans:"X", exp:"해산은 총회 의결이 필요합니다." },
    { q:"새마을금고 회원은 출자금을 상계(相計)할 수 없다.", opts:["O","X"], ans:"O", exp:"새마을금고법은 출자금에 대한 상계를 금지합니다." },
    { q:"새마을금고 대의원의 임기는 2년이다.", opts:["O","X"], ans:"O", exp:"새마을금고 대의원의 임기는 2년입니다." }
  ],
  2: [
    { q:"새마을금고의 지도·감독 주무관청은?", opts:["금융위원회","행정안전부","기획재정부"], ans:"행정안전부", exp:"새마을금고는 행정안전부장관의 지도·감독을 받습니다." },
    { q:"새마을금고법 제정 연도는?", opts:["1980년","1983년","1986년"], ans:"1983년", exp:"새마을금고법은 1983년 1월 1일 제정되었습니다." },
    { q:"새마을금고 회원이 될 수 없는 자는?", opts:["외국인","미성년자","피성년후견인"], ans:"피성년후견인", exp:"피성년후견인은 새마을금고 회원 자격이 없습니다." },
    { q:"새마을금고의 법인 성격으로 옳지 않은 것은?", opts:["사단법인","비영리법인","영리법인"], ans:"영리법인", exp:"새마을금고는 비영리법인입니다." },
    { q:"새마을금고 설립에 적용되는 입법주의는?", opts:["허가주의","인가주의","준칙주의"], ans:"인가주의", exp:"새마을금고는 인가주의에 따라 설립됩니다." },
    { q:"새마을금고 총회의 종류 중 옳지 않은 것은?", opts:["정기총회","임시총회","특별총회"], ans:"특별총회", exp:"총회는 정기총회와 임시총회로만 구분됩니다." },
    { q:"회원의 소수회원권이 아닌 것은?", opts:["총회소집요구권","임원해임요구권","사업이용권"], ans:"사업이용권", exp:"사업이용권은 자익권이며, 소수회원권이 아닙니다." },
    { q:"새마을금고 잉여금 배당의 종류가 아닌 것은?", opts:["출자배당","이용고배당","균등배당"], ans:"균등배당", exp:"잉여금 배당은 출자배당과 이용고배당으로만 이루어집니다." },
    { q:"새마을금고 감사의 권한이 아닌 것은?", opts:["재산상황 감사권","총회소집권","직원 임면권"], ans:"직원 임면권", exp:"감사는 직원 임면권을 가지지 않습니다." },
    { q:"새마을금고의 사업이 아닌 것은?", opts:["예탁금·적금 수납","자금 대출","주식 발행"], ans:"주식 발행", exp:"새마을금고는 주식을 발행할 수 없습니다." },
    { q:"회원의 당연 탈퇴 사유가 아닌 것은?", opts:["사망","파산선고","장기 연체"], ans:"장기 연체", exp:"장기 연체는 당연 탈퇴가 아닌 제명 사유입니다." },
    { q:"새마을금고의 최고의결기관은?", opts:["이사회","총회","감사위원회"], ans:"총회", exp:"새마을금고의 최고의결기관은 총회입니다." },
    { q:"새마을금고 회원의 의결권은?", opts:["출자좌수 비례","1인 1표","자산 비례"], ans:"1인 1표", exp:"새마을금고는 1인 1표 원칙을 따릅니다." },
    { q:"새마을금고의 회계연도는?", opts:["4월 1일~3월 31일","1월 1일~12월 31일","7월 1일~6월 30일"], ans:"1월 1일~12월 31일", exp:"회계연도는 1월 1일부터 12월 31일까지입니다." },
    { q:"새마을금고법에서 가장 무거운 형벌의 최고 형량은?", opts:["3년 이하 징역","5년 이하 징역","7년 이하 징역"], ans:"5년 이하 징역", exp:"새마을금고법의 최고 형벌은 5년 이하 징역 또는 5천만원 이하 벌금입니다." },
    { q:"새마을금고 대의원의 임기는?", opts:["1년","2년","3년"], ans:"2년", exp:"대의원의 임기는 2년입니다." },
    { q:"새마을금고의 해산 사유가 아닌 것은?", opts:["총회의 해산의결","이사장의 해산 선언","설립인가 취소"], ans:"이사장의 해산 선언", exp:"이사장 단독으로 해산을 결정할 수 없습니다." },
    { q:"출자금에 대해 허용되는 것은?", opts:["질권 설정","상계","상속"], ans:"상속", exp:"출자금은 상속이 가능하지만, 질권 설정과 상계는 금지됩니다." },
    { q:"새마을금고 정관의 절대적 기재사항이 아닌 것은?", opts:["목적","명칭","임원의 보수"], ans:"임원의 보수", exp:"임원의 보수는 절대적 기재사항이 아닙니다." },
    { q:"새마을금고 청산 시 청산인의 직무가 아닌 것은?", opts:["채무 변제","잔여재산 인도","새 회원 가입 처리"], ans:"새 회원 가입 처리", exp:"청산 중에는 새로운 영업이나 회원 가입을 처리하지 않습니다." },
    { q:"새마을금고 이사회 소집권자는?", opts:["이사장","감사","중앙회장"], ans:"이사장", exp:"이사회는 이사장이 소집합니다." },
    { q:"새마을금고 예금자보호준비금의 관리 기관은?", opts:["예금보험공사","새마을금고중앙회","행정안전부"], ans:"새마을금고중앙회", exp:"예금자보호준비금은 새마을금고중앙회에 설치됩니다." },
    { q:"새마을금고 회원의 공익권이 아닌 것은?", opts:["의결권","선거권","사업이용권"], ans:"사업이용권", exp:"사업이용권은 자익권입니다." },
    { q:"새마을금고 합병 시 필요한 것은?", opts:["이사회 의결만으로 가능","총회 의결이 필요","감사의 동의만으로 가능"], ans:"총회 의결이 필요", exp:"합병은 총회의 의결을 거쳐야 합니다." },
    { q:"이사장과 금고 간 소송에서 금고를 대표하는 자는?", opts:["부이사장","감사","중앙회장"], ans:"감사", exp:"이사장과 금고 간 소송에서는 감사가 금고를 대표합니다." }
  ],
  3: [
    { q:"새마을금고의 지도·감독 주무관청은?", opts:["금융감독원","금융위원회","행정안전부","기획재정부"], ans:"행정안전부", exp:"새마을금고는 행정안전부장관의 지도·감독을 받습니다." },
    { q:"새마을금고법 제정 법률 번호는?", opts:["법률 제2822호","법률 제3622호","법률 제4322호","법률 제5022호"], ans:"법률 제3622호", exp:"새마을금고법은 1983년 법률 제3622호로 제정되었습니다." },
    { q:"새마을금고 회원의 당연 탈퇴 사유가 아닌 것은?", opts:["사망","파산선고","피성년후견 선고","장기 연체"], ans:"장기 연체", exp:"장기 연체는 당연 탈퇴가 아닌 제명 사유입니다." },
    { q:"새마을금고의 최고의결기관은?", opts:["이사회","감사위원회","총회","중앙회"], ans:"총회", exp:"새마을금고의 최고의결기관은 총회입니다." },
    { q:"새마을금고 임원이 아닌 것은?", opts:["이사장","이사","감사","지배인"], ans:"지배인", exp:"지배인은 직원이며 임원이 아닙니다." },
    { q:"새마을금고 설립에 적용되는 입법주의는?", opts:["자유설립주의","준칙주의","인가주의","허가주의"], ans:"인가주의", exp:"새마을금고는 인가주의에 따라 설립됩니다." },
    { q:"새마을금고 소수회원권에 해당하는 것은?", opts:["의결권","선거권","사업이용권","총회소집요구권"], ans:"총회소집요구권", exp:"총회소집요구권은 소수회원권입니다." },
    { q:"새마을금고의 회계연도로 옳은 것은?", opts:["4월 1일~3월 31일","7월 1일~6월 30일","10월 1일~9월 30일","1월 1일~12월 31일"], ans:"1월 1일~12월 31일", exp:"회계연도는 1월 1일부터 12월 31일까지입니다." },
    { q:"새마을금고 회원의 의결권은?", opts:["출자좌수 비례","자산 비례","이용실적 비례","1인 1표"], ans:"1인 1표", exp:"새마을금고는 1인 1표 원칙을 따릅니다." },
    { q:"새마을금고 출자금에 대해 금지되는 것은?", opts:["상속","양도","질권 설정","출자전환"], ans:"질권 설정", exp:"출자금에 대한 질권 설정은 금지됩니다." },
    { q:"총회소집요구권을 행사하려면?", opts:["재적회원 1/10 이상","재적회원 1/5 이상","재적회원 1/4 이상","재적회원 1/3 이상"], ans:"재적회원 1/5 이상", exp:"총회소집요구권은 재적회원 1/5 이상이 연서해야 합니다." },
    { q:"새마을금고 잉여금 배당 방식으로 옳은 것은?", opts:["균등배당과 성과배당","출자배당과 이용고배당","실적배당과 균등배당","출자배당과 균등배당"], ans:"출자배당과 이용고배당", exp:"잉여금 배당은 출자배당과 이용고배당으로 이루어집니다." },
    { q:"새마을금고 해산 사유가 아닌 것은?", opts:["정관에 정한 해산 사유 발생","총회의 해산의결","이사장의 해산 선언","설립인가 취소"], ans:"이사장의 해산 선언", exp:"이사장 단독으로 해산을 결정할 수 없습니다." },
    { q:"새마을금고 대의원의 임기는?", opts:["1년","2년","3년","4년"], ans:"2년", exp:"대의원의 임기는 2년입니다." },
    { q:"새마을금고 법인의 성격으로 모두 옳은 것은?", opts:["사단법인·비영리법인·특수법인","재단법인·비영리법인·특수법인","사단법인·영리법인·특수법인","재단법인·영리법인·일반법인"], ans:"사단법인·비영리법인·특수법인", exp:"새마을금고는 사단법인, 비영리법인, 특수법인의 성격을 가집니다." },
    { q:"새마을금고법의 최고 벌칙은?", opts:["2년 이하 징역 또는 2천만원 이하 벌금","3년 이하 징역 또는 3천만원 이하 벌금","5년 이하 징역 또는 5천만원 이하 벌금","7년 이하 징역 또는 7천만원 이하 벌금"], ans:"5년 이하 징역 또는 5천만원 이하 벌금", exp:"새마을금고법의 최고 형벌은 5년 이하 징역 또는 5천만원 이하 벌금입니다." },
    { q:"새마을금고 총회 소집권자가 아닌 것은?", opts:["이사장","감사","지배인","청산인"], ans:"지배인", exp:"지배인은 총회 소집권자가 아닙니다." },
    { q:"새마을금고 정관의 절대적 기재사항이 아닌 것은?", opts:["목적","명칭","임원의 보수","업무구역"], ans:"임원의 보수", exp:"임원의 보수는 절대적 기재사항이 아닙니다." },
    { q:"새마을금고 회원의 제명 절차에 관한 설명 중 틀린 것은?", opts:["이사장 단독으로 제명할 수 있다","제명은 총회 의결을 거쳐야 한다","제명된 회원은 출자금 환급을 청구할 수 있다","제명 사유가 있어야 한다"], ans:"이사장 단독으로 제명할 수 있다", exp:"제명은 총회 의결을 거쳐야 하며, 이사장 단독으로 결정할 수 없습니다." },
    { q:"새마을금고가 할 수 있는 신용사업이 아닌 것은?", opts:["예탁금·적금 수납","자금 대출","어음할인","주식 인수"], ans:"주식 인수", exp:"주식 인수는 새마을금고의 신용사업이 아닙니다." },
    { q:"새마을금고 감사의 특별한 권한이 아닌 것은?", opts:["금고 대표권(소송 시)","총회 소집권","이사회 소집권","임원 임명권"], ans:"임원 임명권", exp:"감사는 임원 임명권을 가지지 않습니다." },
    { q:"새마을금고 청산 시 청산인의 직무가 아닌 것은?", opts:["현존 사무 종결","채권 추심","채무 변제","새로운 사업 개시"], ans:"새로운 사업 개시", exp:"청산 중에는 새로운 사업을 개시할 수 없습니다." },
    { q:"새마을금고 이사회 결의 성립 요건은?", opts:["이사 과반수 출석·과반수 찬성","이사 전원 출석·전원 찬성","이사 1/3 출석·과반수 찬성","이사 2/3 출석·2/3 찬성"], ans:"이사 과반수 출석·과반수 찬성", exp:"이사회는 이사 과반수의 출석과 출석이사 과반수의 찬성으로 의결합니다." },
    { q:"새마을금고 예금자보호준비금에 관한 설명 중 틀린 것은?", opts:["금고 회원의 예탁금을 보호한다","예금보험공사가 관리한다","중앙회에 설치된다","일정 비율로 조성된다"], ans:"예금보험공사가 관리한다", exp:"새마을금고 예금자보호준비금은 예금보험공사가 아닌 새마을금고중앙회에 설치됩니다." },
    { q:"새마을금고의 주소는 어디에 두는가?", opts:["이사장의 주소지","주된 사무소 소재지","중앙회 소재지","행정안전부 소재지"], ans:"주된 사무소 소재지", exp:"새마을금고의 주소는 주된 사무소 소재지에 둡니다." }
  ]
};

const SECTOR_NAMES = { 1:'섹터1 OX퀴즈', 2:'섹터2 3지선다', 3:'섹터3 4지선다' };

let state = { players:{}, battles:{}, nextPlayerId:1, pendingChallenges:{} };

function getSocket(sid) { return io.sockets.sockets.get(sid); }
function shuffle(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function randomSector() { return Math.floor(Math.random()*3)+1; } // ★ 랜덤 섹터
function selectQuestions(sector,count) { return shuffle(QUIZ_DB[sector]).slice(0,Math.min(count,QUIZ_DB[sector].length)); }
function publicPlayers() {
  return Object.values(state.players).map(p=>({
    id:p.id,name:p.name,team:p.team,wins:p.wins,losses:p.losses,
    correct:p.correct,total:p.total,online:p.online,battleCount:p.battled.length,inBattle:p.inBattle
  }));
}
function emitRankings() { io.emit('playersUpdate',publicPlayers()); }

function startBattle(p1Id,p2Id) {
  const sector=randomSector();
  const qs=selectQuestions(sector,5);
  const battleId=`${p1Id}_${p2Id}_${Date.now()}`;
  state.battles[battleId]={id:battleId,players:[p1Id,p2Id],questions:qs,currentQ:0,
    scores:{[p1Id]:0,[p2Id]:0},qAnswers:{},qResolved:{},timer:null,status:'active',sector};
  state.players[p1Id].inBattle=true;
  state.players[p2Id].inBattle=true;
  sendQuestion(battleId,0);
  emitRankings();
}

function sendQuestion(battleId,qIdx) {
  const battle=state.battles[battleId];
  if(!battle||battle.status!=='active') return;
  const q=battle.questions[qIdx];
  const payload={battleId,qIdx,question:q.q,options:q.opts,
    sector:battle.sector,sectorName:SECTOR_NAMES[battle.sector],
    scores:battle.scores,totalQ:battle.questions.length};
  battle.players.forEach(pid=>getSocket(state.players[pid]?.socketId)?.emit('battleQuestion',payload));
  if(battle.timer) clearTimeout(battle.timer);
  battle.timer=setTimeout(()=>resolveQuestion(battleId,qIdx,null),QUESTION_TIME_MS+600);
}

function resolveQuestion(battleId,qIdx,winnerId) {
  const battle=state.battles[battleId];
  if(!battle||battle.qResolved[qIdx]||battle.status!=='active') return;
  battle.qResolved[qIdx]=true;
  if(battle.timer){clearTimeout(battle.timer);battle.timer=null;}
  const q=battle.questions[qIdx];
  const [p1,p2]=battle.players;
  if(winnerId){battle.scores[winnerId]++;state.players[winnerId].correct++;}
  const result={qIdx,winnerId,correctAnswer:q.ans,explanation:q.exp,
    scores:battle.scores,p1Id:p1,p2Id:p2,sector:battle.sector,sectorName:SECTOR_NAMES[battle.sector]};
  battle.players.forEach(pid=>getSocket(state.players[pid]?.socketId)?.emit('questionResult',result));
  const s1=battle.scores[p1],s2=battle.scores[p2];
  const nextQ=qIdx+1;
  const isOver=s1>=3||s2>=3||nextQ>=battle.questions.length;
  if(isOver) setTimeout(()=>endBattle(battleId),2600);
  else{battle.currentQ=nextQ;setTimeout(()=>sendQuestion(battleId,nextQ),2600);}
}

function endBattle(battleId) {
  const battle=state.battles[battleId];
  if(!battle||battle.status==='finished') return;
  battle.status='finished';
  const [p1,p2]=battle.players;
  const s1=battle.scores[p1],s2=battle.scores[p2];
  const winner=s1>s2?p1:s2>s1?p2:null;
  if(winner){state.players[winner].wins++;state.players[winner===p1?p2:p1].losses++;}
  battle.players.forEach(pid=>{
    const p=state.players[pid];
    p.total+=battle.questions.length;
    p.battled.push(pid===p1?p2:p1);
    p.inBattle=false;
  });
  battle.players.forEach(pid=>{
    getSocket(state.players[pid]?.socketId)?.emit('battleEnd',{
      winner,finalScores:battle.scores,p1Id:p1,p2Id:p2,
      p1Name:state.players[p1].name,p2Name:state.players[p2].name,
      yourId:pid,sector:battle.sector,sectorName:SECTOR_NAMES[battle.sector]
    });
  });
  emitRankings();
}

io.on('connection',(socket)=>{
  socket.on('register',({name,team})=>{
    const id=state.nextPlayerId++;
    state.players[id]={id,name:name.trim(),team:parseInt(team),socketId:socket.id,
      wins:0,losses:0,correct:0,total:0,battled:[],online:true,inBattle:false};
    socket.playerId=id;
    socket.emit('registered',{id,player:state.players[id]});
    emitRankings();
  });

  socket.on('reconnectPlayer',(id)=>{
    const p=state.players[id];
    if(p){p.socketId=socket.id;p.online=true;socket.playerId=id;
      socket.emit('reconnected',{player:p});emitRankings();
    } else socket.emit('reconnectFailed');
  });

  socket.on('challenge',(oppId)=>{
    const me=state.players[socket.playerId],opp=state.players[oppId];
    if(!me||!opp) return socket.emit('challengeError','존재하지 않는 번호입니다.');
    if(oppId===socket.playerId) return socket.emit('challengeError','자기 자신에게 도전할 수 없습니다.');
    if(me.battled.includes(oppId)||opp.battled.includes(socket.playerId))
      return socket.emit('challengeError','이미 대결한 상대입니다.');
    if(me.inBattle) return socket.emit('challengeError','현재 대결 중입니다.');
    if(opp.inBattle) return socket.emit('challengeError','상대방이 현재 대결 중입니다.');
    state.pendingChallenges[socket.playerId]=oppId;
    const os2=getSocket(opp.socketId);
    if(!os2) return socket.emit('challengeError','상대방이 현재 접속 중이 아닙니다.');
    os2.emit('challenged',{challengerId:me.id,challengerName:me.name,challengerTeam:me.team});
    socket.emit('challengeSent',{opponentId:oppId,opponentName:opp.name});
  });

  socket.on('acceptChallenge',(cId)=>{
    if(state.pendingChallenges[cId]!==socket.playerId) return;
    delete state.pendingChallenges[cId];
    startBattle(cId,socket.playerId);
  });

  socket.on('rejectChallenge',(cId)=>{
    delete state.pendingChallenges[cId];
    getSocket(state.players[cId]?.socketId)?.emit('challengeRejected',{opponentName:state.players[socket.playerId]?.name});
  });

  socket.on('cancelChallenge',()=>{
    const oId=state.pendingChallenges[socket.playerId];
    if(oId){getSocket(state.players[oId]?.socketId)?.emit('challengeCancelled');delete state.pendingChallenges[socket.playerId];}
  });

  socket.on('submitAnswer',({battleId,qIdx,answer})=>{
    const battle=state.battles[battleId];
    if(!battle||battle.status!=='active'||battle.currentQ!==qIdx||battle.qResolved[qIdx]) return;
    const pid=socket.playerId;
    const key=`${qIdx}_${pid}`;
    if(battle.qAnswers[key]) return;
    const q=battle.questions[qIdx];
    const isCorrect=answer===q.ans;
    battle.qAnswers[key]={answer,time:Date.now(),correct:isCorrect};
    if(isCorrect){resolveQuestion(battleId,qIdx,pid);}
    else{
      const [p1,p2]=battle.players;
      const otherId=pid===p1?p2:p1;
      const otherAns=battle.qAnswers[`${qIdx}_${otherId}`];
      if(otherAns&&!otherAns.correct) resolveQuestion(battleId,qIdx,null);
    }
  });

  socket.on('adminAuth',(pw)=>{
    if(pw===ADMIN_PASSWORD){socket.isAdmin=true;socket.emit('adminAuthResult',{success:true});}
    else socket.emit('adminAuthResult',{success:false});
  });

  socket.on('resetScores',()=>{
    if(!socket.isAdmin) return;
    Object.values(state.battles).forEach(b=>{if(b.timer)clearTimeout(b.timer);});
    state.battles={};state.pendingChallenges={};
    Object.values(state.players).forEach(p=>{p.wins=0;p.losses=0;p.correct=0;p.total=0;p.battled=[];p.inBattle=false;});
    io.emit('scoresReset');emitRankings();
  });

  socket.on('resetAll',()=>{
    if(!socket.isAdmin) return;
    Object.values(state.battles).forEach(b=>{if(b.timer)clearTimeout(b.timer);});
    state.players={};state.battles={};state.pendingChallenges={};state.nextPlayerId=1;
    io.emit('serverReset');emitRankings();
  });

  socket.on('getRankings',()=>socket.emit('playersUpdate',publicPlayers()));

  socket.on('disconnect',()=>{
    if(socket.playerId&&state.players[socket.playerId]) state.players[socket.playerId].online=false;
    const oId=state.pendingChallenges[socket.playerId];
    if(oId){getSocket(state.players[oId]?.socketId)?.emit('challengeCancelled');delete state.pendingChallenges[socket.playerId];}
    emitRankings();
  });
});

app.use(express.static(path.join(__dirname,'public')));
server.listen(PORT,'0.0.0.0',()=>{
  const nets=os.networkInterfaces();
  console.log('\n========================================');
  console.log('🏦  새마을금고 퀴즈 대결 서버 시작!');
  console.log('========================================');
  Object.values(nets).flat().filter(n=>n.family==='IPv4'&&!n.internal)
    .forEach(n=>console.log(`   👉  http://${n.address}:${PORT}`));
  console.log(`\n🔐  관리자 비밀번호: ${ADMIN_PASSWORD}`);
  console.log('========================================\n');
});
