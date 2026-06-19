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

// ===== 퀴즈 블록 (카테고리 순번별) =====
let QUIZ_BLOCKS = {
  1: {label:"1~10강", range:"강의의 출발점 ~ 금고법과 민법의 관계", questions:[
      {q:"새마을금고법은 금고와 중앙회의 조직·사업·운영을 이해하는 기본 법이다.",opts:["O","X"],ans:"O",exp:"새마을금고법은 금고와 중앙회의 조직·사업·운영을 규율하는 기본 법입니다."},
      {q:"상부상조 정신은 회원 간 협동과 공동이익을 위한 협동조합의 핵심 정신이며, 이윤 극대화와는 다른 개념이다.",opts:["O","X"],ans:"O",exp:"상부상조는 이윤 극대화가 아닌 회원 상호 협력을 위한 협동조합 정신입니다."},
      {q:"금고 설립 시 창립총회, 설립인가, 설립등기의 3단계가 필요하다.",opts:["O","X"],ans:"O",exp:"창립총회 → 설립인가 → 설립등기 순으로 진행됩니다."},
      {q:"새마을금고법은 일반법인 민법보다 나중에 보충적으로 적용된다.",opts:["O","X"],ans:"X",exp:"특별법인 새마을금고법이 일반법인 민법보다 먼저 우선 적용됩니다."},
      {q:"실질적 의의의 금고법에는 정관, 규약, 업무방법 등 자치규범도 포함된다.",opts:["O","X"],ans:"O",exp:"실질적 의의의 금고법은 금고를 규율하는 모든 규범을 포괄합니다."}
  ]},
  2: {label:"11~20강", range:"금고법과 상법의 관계 ~ 새마을금고는 왜 일반 영리 금융회사와 다른가", questions:[
      {q:"협동조합 원칙상 가입 자유란 자격이 있는 사람의 가입 거절을 금지하는 원칙이다.",opts:["O","X"],ans:"O",exp:"가입 자유는 자격을 갖춘 사람의 자유로운 가입을 보장합니다."},
      {q:"평등한 의결권은 출자좌수에 비례하여 의결권이 더 많이 주어지는 것을 의미한다.",opts:["O","X"],ans:"X",exp:"평등한 의결권은 출자좌수와 무관한 1인 1표 원칙입니다."},
      {q:"금고는 법적 성격상 사단법인에 해당한다.",opts:["O","X"],ans:"O",exp:"금고는 회원이라는 인적 결합을 기초로 하는 사단법인입니다."},
      {q:"비영리법인인 금고는 이익이 발생해도 어떠한 이윤배당도 할 수 없다.",opts:["O","X"],ans:"X",exp:"비영리법인은 이윤 극대화를 목적으로 하지 않는 것이며, 출자배당은 가능합니다."},
      {q:"회원의 책임은 원칙적으로 출자액 한도로 제한되는 유한책임이다.",opts:["O","X"],ans:"O",exp:"금고 회원은 출자한 금액의 범위에서만 책임을 지는 유한책임을 집니다."}
  ]},
  3: {label:"21~30강", range:"금고는 특수법인이다 ~ 정치 관여 금지", questions:[
      {q:"민법상 조합은 법인격이 없어 금고와 법적 지위가 다르다.",opts:["O","X"],ans:"O",exp:"민법상 조합은 계약관계이고 법인격이 없으며, 금고는 법인격을 가집니다."},
      {q:"금고는 정관 목적 범위를 벗어난 사업도 자유롭게 수행할 수 있다.",opts:["O","X"],ans:"X",exp:"법인의 권리능력은 정관에 기재된 목적 범위 내로 제한됩니다."},
      {q:"이사장은 금고를 대표하고 법률행위를 수행하는 대표기관이다.",opts:["O","X"],ans:"O",exp:"이사장은 금고의 대표기관으로서 금고 명의로 법률행위를 수행합니다."},
      {q:"직원의 불법행위로 인한 손해는 금고의 사용자책임과 연결될 수 있다.",opts:["O","X"],ans:"O",exp:"금고는 직원의 업무 중 불법행위에 대해 사용자로서 책임을 질 수 있습니다."},
      {q:"업무구역은 사업 범위를 나타낼 뿐 회원 자격 판단과는 무관하다.",opts:["O","X"],ans:"X",exp:"업무구역은 회원 자격 요건 판단의 출발점이 됩니다."}
  ]},
  4: {label:"31~40강", range:"다른 법률과의 관계 ~ 출자좌수 한도와 민주적 관리", questions:[
      {q:"새마을금고의 법적 성격은 법인·사단법인·사법인·비영리법인·특수법인 5가지이다.",opts:["O","X"],ans:"O",exp:"금고는 이 5가지 법적 성격을 복합적으로 가집니다."},
      {q:"지역금고 회원이 되려면 해당 업무구역 내에 주소·거소·사업장 중 하나를 두어야 한다.",opts:["O","X"],ans:"O",exp:"업무구역 내 주소·거소·사업장은 지역금고 회원 자격의 기본 요건입니다."},
      {q:"가입 자유 원칙에 따라 회원은 언제든지 임의로 탈퇴할 수 있다.",opts:["O","X"],ans:"O",exp:"임의 탈퇴 자유는 협동조합의 가입·탈퇴 자유 원칙에서 나옵니다."},
      {q:"1인당 출자좌수 한도는 법령에 의해 제한이 없어 무제한 출자가 가능하다.",opts:["O","X"],ans:"X",exp:"1인당 출자좌수 한도는 법령에 의해 제한되어 민주적 관리 원칙을 보장합니다."},
      {q:"출자 1좌의 금액은 정관으로 정하며, 이것이 금고 자본금의 기초가 된다.",opts:["O","X"],ans:"O",exp:"출자 1좌의 금액은 정관으로 정하고, 회원의 출자 총액이 금고의 자본금을 구성합니다."}
  ]},
  5: {label:"41~50강", range:"의결권·선거권 제한 ~ 회원 제명 사유", questions:[
      {q:"의결권과 선거권은 출자좌수가 많을수록 더 많이 행사할 수 있다.",opts:["O","X"],ans:"X",exp:"의결권과 선거권은 1인 1표 원칙이며 출자좌수와 무관하게 평등하게 부여됩니다."},
      {q:"의결권은 대리인을 통해 행사할 수 있으며, 이를 의결권의 대리행사라 한다.",opts:["O","X"],ans:"O",exp:"회원은 정관이 정하는 바에 따라 대리인을 통해 의결권을 행사할 수 있습니다."},
      {q:"회원의 출자금은 금고에 대한 채무와 상계할 수 있다.",opts:["O","X"],ans:"X",exp:"출자금의 상계 및 질권 설정은 법령에 의해 금지됩니다."},
      {q:"회원은 임의로 탈퇴할 수 있으며, 회계연도 말에 탈퇴 효력이 발생하는 것이 원칙이다.",opts:["O","X"],ans:"O",exp:"회원의 임의 탈퇴는 가입 자유 원칙에 따라 보장되며, 회계연도 말 효력이 원칙입니다."},
      {q:"회원의 제명은 금고 이사회의 의결만으로 확정된다.",opts:["O","X"],ans:"X",exp:"회원 제명은 총회의 의결을 요하며, 이사회 단독으로 확정할 수 없습니다."}
  ]},
  6: {label:"51~60강", range:"회원 제명 절차와 효과 ~ 정관 변경과 인가", questions:[
      {q:"총회는 금고의 최고 의사결정기관으로서 중요 사항을 의결한다.",opts:["O","X"],ans:"O",exp:"총회는 회원으로 구성되는 금고의 최고 의사결정기관입니다."},
      {q:"총회 전속사항은 이사회에 위임하여 결의할 수 있다.",opts:["O","X"],ans:"X",exp:"총회 전속사항은 다른 기관에 임의로 위임할 수 없습니다."},
      {q:"회원 제명 절차에서 해당 회원에게 소명 기회를 주어야 한다.",opts:["O","X"],ans:"O",exp:"회원 제명 시 피제명 회원에게 소명할 기회를 부여해야 하며, 이를 생략하면 절차상 하자가 됩니다."},
      {q:"배당청구권은 금고 경영에 참여하는 공익권에 해당한다.",opts:["O","X"],ans:"X",exp:"배당청구권은 개인의 경제적 이익을 위한 자익권입니다."},
      {q:"정관 변경은 총회의 특별결의 사항이며, 행정청의 인가가 필요한 경우가 있다.",opts:["O","X"],ans:"O",exp:"정관 변경은 총회 특별결의 후 주무 행정청 인가가 필요한 중요 사항입니다."}
  ]},
  7: {label:"61~70강", range:"총회의 종류와 소집권자 ~ 제2부 핵심 정리", questions:[
      {q:"총회 보통결의는 재적회원 과반수 출석, 출석회원 과반수 찬성으로 성립한다.",opts:["O","X"],ans:"O",exp:"보통결의는 재적 과반수 출석 + 출석 과반수 찬성으로 성립합니다."},
      {q:"대의원회는 회원이 많은 금고에서 총회를 효율적으로 운영하기 위해 도입된 제도이다.",opts:["O","X"],ans:"O",exp:"대의원회는 대규모 금고의 총회 운영 효율화를 위한 제도입니다."},
      {q:"총회 결의에 하자가 있으면 기간 제한 없이 언제든지 취소 소를 제기할 수 있다.",opts:["O","X"],ans:"X",exp:"결의 취소의 소는 일정 기간 내에 제기해야 하며, 기간이 지나면 결의가 확정됩니다."},
      {q:"정관 변경이나 합병·해산 등 중요 사항은 총회의 특별결의로 처리한다.",opts:["O","X"],ans:"O",exp:"합병·해산·정관 변경 등 중요 사항은 보통결의보다 엄격한 특별결의 요건을 충족해야 합니다."},
      {q:"대의원의 자격과 정수, 임기는 법령과 정관에서 정한 기준에 따른다.",opts:["O","X"],ans:"O",exp:"대의원의 자격·정수·임기는 법령 및 정관이 정하는 바에 따릅니다."}
  ]},
  8: {label:"71~80강", range:"제3부 학습목표 ~ 상근임원의 의미", questions:[
      {q:"재적이사 3분의 1 이상이 요구하면 이사장은 이사회를 소집해야 한다.",opts:["O","X"],ans:"O",exp:"재적이사 1/3 이상의 요구 시 이사장은 지체 없이 이사회를 소집합니다."},
      {q:"금고 임원은 이사장, 이사, 감사로 구성된다.",opts:["O","X"],ans:"O",exp:"금고의 임원은 이사장·이사·감사로 구성됩니다."},
      {q:"이사회는 금고의 업무집행에 관한 최고 의결기관으로서 이사장을 포함한 이사로 구성된다.",opts:["O","X"],ans:"O",exp:"이사회는 이사장을 포함한 이사들로 구성되는 업무집행 관련 최고 의결기관입니다."},
      {q:"임원은 원칙적으로 명예직이지만, 일정 요건 충족 시 상근임원을 둘 수 있다.",opts:["O","X"],ans:"O",exp:"임원은 명예직이 원칙이며 자산 규모 등 요건에 따라 상근임원 설치가 가능합니다."},
      {q:"상근이사는 이사 중 2명을 한도로 둘 수 있다.",opts:["O","X"],ans:"O",exp:"시행령에 따라 상근이사는 이사 중 2명 한도 내에서 설치합니다."}
  ]},
  9: {label:"81~90강", range:"상근임원의 자격요건 ~ 임원의 의무", questions:[
      {q:"이사장은 회원의 무기명 비밀투표로 직접 선출하는 것이 원칙이다.",opts:["O","X"],ans:"O",exp:"이사장은 회원이 직접 무기명 비밀투표로 선출합니다."},
      {q:"이사장을 제외한 임원은 다수득표자 순으로 정수만큼 선출하는 방식이 기본이다.",opts:["O","X"],ans:"O",exp:"이사장 외 임원은 총회에서 다수득표자 순으로 정수를 선출합니다."},
      {q:"파산선고 후 미복권자도 일정 기간이 지나면 임원이 될 수 있다.",opts:["O","X"],ans:"X",exp:"파산선고 후 복권되지 않은 자는 임원 결격사유에 해당하며, 단순 시간 경과로 해소되지 않습니다."},
      {q:"이사장과 이사의 임기는 4년, 감사의 임기는 3년이다.",opts:["O","X"],ans:"O",exp:"이사장·이사는 4년, 감사는 3년의 임기를 가집니다."},
      {q:"이사장은 횟수 제한 없이 연임이 가능하다.",opts:["O","X"],ans:"X",exp:"이사장은 2차에 한하여 연임할 수 있으며, 3선 이상은 허용되지 않습니다."}
  ]},
  10: {label:"91~100강", range:"임원의 책임 ~ 차입·상환준비금·여유자금 운용", questions:[
      {q:"임원이 법령·정관을 위반하거나 임무를 게을리하여 금고에 손해를 끼친 경우 배상 책임을 진다.",opts:["O","X"],ans:"O",exp:"임원은 고의 또는 과실로 법령·정관 위반이나 임무 해태로 금고에 손해를 끼치면 배상 책임을 집니다."},
      {q:"금고 직원이 업무 수행 중 제3자에게 손해를 끼친 경우 금고도 사용자책임을 질 수 있다.",opts:["O","X"],ans:"O",exp:"금고는 직원의 업무집행 중 불법행위에 대해 사용자로서 손해배상 책임을 질 수 있습니다."},
      {q:"금고의 직원은 금고에 대해 사용자 지위를 가진다.",opts:["O","X"],ans:"X",exp:"직원은 피사용자이고, 금고가 사용자 지위를 가집니다."},
      {q:"금고는 신용사업에서 동일인 대출한도 규제를 받는다.",opts:["O","X"],ans:"O",exp:"금고의 신용사업에는 건전성 규제 차원에서 동일인 대출한도 제한이 적용됩니다."},
      {q:"금고 사업의 기본 원칙은 회원 이익 증진과 지역사회 발전이다.",opts:["O","X"],ans:"O",exp:"금고의 사업은 비영리·협동조합 원칙에 따라 회원과 지역사회를 위해 수행됩니다."}
  ]},
  11: {label:"101~110강", range:"공제사업·회계·제4부 학습목표 ~ 중앙회 총회의 의결사항", questions:[
      {q:"비회원도 법령이 허용하는 범위 내에서 금고의 사업을 이용할 수 있다.",opts:["O","X"],ans:"O",exp:"금고는 일정 한도에서 비회원에게도 사업을 제공할 수 있습니다."},
      {q:"중앙회는 금고를 회원으로 하는 비영리법인이다.",opts:["O","X"],ans:"O",exp:"중앙회는 금고의 공동이익 증진을 위해 금고를 회원으로 하는 비영리법인입니다."},
      {q:"중앙회는 금고의 건전한 발전과 회원의 경제적·사회적 지위 향상을 목적으로 한다.",opts:["O","X"],ans:"O",exp:"중앙회의 목적은 금고의 건전한 발전과 회원의 경제적·사회적 지위 향상에 있습니다."},
      {q:"중앙회 총회는 금고 이사장 등 정관이 정하는 회원으로 구성된다.",opts:["O","X"],ans:"O",exp:"중앙회 총회는 금고 이사장 등 정관이 정한 회원 자격자로 구성됩니다."},
      {q:"중앙회의 사업계획·예산 승인은 중앙회 이사회 단독으로 결정할 수 있다.",opts:["O","X"],ans:"X",exp:"중앙회의 사업계획·예산 등 중요 사항은 총회의 의결 사항으로, 이사회 단독 결정이 불가합니다."}
  ]},
  12: {label:"111~120강", range:"중앙회 기관 구조 ~ 준비금의 지급과 대위권", questions:[
      {q:"중앙회 회장은 금고 이사장이 자동으로 겸임한다.",opts:["O","X"],ans:"X",exp:"중앙회 회장은 중앙회 총회에서 별도로 선출되며, 금고 이사장과는 다른 직위입니다."},
      {q:"중앙회 신용사업은 일반 시중은행과 동일한 기준이 적용된다.",opts:["O","X"],ans:"X",exp:"중앙회의 신용사업은 협동조합적 성격을 반영한 별도 기준이 적용됩니다."},
      {q:"예금자보호준비금을 대위변제한 중앙회는 채무자에 대한 구상권을 취득한다.",opts:["O","X"],ans:"O",exp:"대위변제 후 중앙회는 채무자에 대한 대위권(구상권)을 취득합니다."},
      {q:"예금자보호준비금은 회원 재산 보호와 금고의 건전한 육성을 목적으로 한다.",opts:["O","X"],ans:"O",exp:"예금자보호준비금의 목적은 회원 재산 보호와 금고의 건전한 육성입니다."},
      {q:"중앙회의 지도·지원 기능은 금고 운영을 지원하고 건전성을 높이는 역할을 한다.",opts:["O","X"],ans:"O",exp:"중앙회는 금고의 건전한 운영을 위해 지도·지원 기능을 수행합니다."}
  ]},
  13: {label:"121~130강", range:"감독 체계의 큰 그림 ~ 중앙회의 지도·감독", questions:[
      {q:"금고에 대한 전반적 감독권은 주무부장관이 행사한다.",opts:["O","X"],ans:"O",exp:"주무부장관은 금고에 대한 보고·검사·처분 등 전반적 감독권을 행사합니다."},
      {q:"경영건전성기준은 금고의 재무구조와 리스크 관리를 위한 기준이다.",opts:["O","X"],ans:"O",exp:"경영건전성기준은 금고의 안정적 운영을 위한 재무·리스크 관리 기준입니다."},
      {q:"적기시정조치는 금고 경영 악화를 조기에 감지하여 사전적으로 개입하는 감독 제도이다.",opts:["O","X"],ans:"O",exp:"적기시정조치는 경영 악화 조기 감지 및 사전 개입을 위한 감독 수단입니다."},
      {q:"금고는 일정 규모 이상인 경우 외부 감사인에 의한 외부감사를 받아야 한다.",opts:["O","X"],ans:"O",exp:"일정 기준 이상의 금고는 외부 감사인에 의한 외부감사 의무가 부과됩니다."},
      {q:"계약이전 결정은 부실 금고의 자산·부채를 다른 기관에 이전하는 감독 수단이다.",opts:["O","X"],ans:"O",exp:"계약이전 결정은 부실 금고 처리를 위해 자산·부채를 정상 기관에 이전하는 제도입니다."}
  ]},
};
const ALL_BLOCK_NOS = Object.keys(QUIZ_BLOCKS).map(Number).sort((a,b)=>a-b);
let state = {
  players:{}, battles:{}, nextPlayerId:1, pendingChallenges:{},
  finalStage: false,
  activeBlocks: [...ALL_BLOCK_NOS],
  stageTimer: null,
  stageRemaining: 0,
  stageDuration: 420,
  stageActive: false,
  lockNew: false
};

function getSocket(sid){return io.sockets.sockets.get(sid);}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function selectQuestions(count){
  let pool=[];
  const blocks=(state.activeBlocks&&state.activeBlocks.length)?state.activeBlocks:ALL_BLOCK_NOS;
  blocks.forEach(bno=>{const b=QUIZ_BLOCKS[bno];if(b&&b.questions)pool=pool.concat(b.questions);});
  if(pool.length===0){ALL_BLOCK_NOS.forEach(bno=>{pool=pool.concat(QUIZ_BLOCKS[bno].questions);});}
  return shuffle(pool).slice(0,Math.min(count,pool.length));
}
function activeBlockLabel(){
  const blocks=(state.activeBlocks&&state.activeBlocks.length)?state.activeBlocks:ALL_BLOCK_NOS;
  return blocks.map(b=>`${b}번(${QUIZ_BLOCKS[b]?.label||''})`).join(', ');
}
function publicPlayers(){return Object.values(state.players).map(p=>({id:p.id,name:p.name,team:p.team,wins:p.wins,losses:p.losses,correct:p.correct,total:p.total,online:p.online,battleCount:p.battled.length,inBattle:p.inBattle}));}
function emitRankings(){io.emit('playersUpdate',publicPlayers());}
function emitFinalStage(){io.emit('finalStageChanged',{active:state.finalStage});}
function emitSystemState(socket){
  (socket||io).emit('systemState',{
    finalStage:state.finalStage,
    stageActive:state.stageActive,
    stageRemaining:state.stageRemaining,
    stageDuration:state.stageDuration,
    lockNew:state.lockNew,
    activeBlocks:state.activeBlocks,
    blockLabel:activeBlockLabel()
  });
}

// ── 스테이지 타이머 ──
function startStageTimer(minutes){
  if(state.stageTimer) clearInterval(state.stageTimer);
  state.stageDuration = (minutes||7)*60;
  state.stageRemaining = state.stageDuration;
  state.stageActive = true;
  state.lockNew = false;
  broadcastStageUpdate();
  state.stageTimer = setInterval(()=>{
    state.stageRemaining--;
    if(state.stageRemaining <= 20 && !state.lockNew){
      state.lockNew = true;
      io.emit('stageWarning', {remaining: state.stageRemaining});
    }
    broadcastStageUpdate();
    if(state.stageRemaining <= 0){
      clearInterval(state.stageTimer);
      state.stageTimer = null;
      state.stageActive = false;
      state.lockNew = false;
      // 진행 중 대결 무효 처리
      Object.values(state.battles).forEach(b=>{
        if(b.status==='active'){
          if(b.timer) clearTimeout(b.timer);
          b.status='finished';
          b.players.forEach(pid=>{
            const p=state.players[pid];
            if(p){p.inBattle=false;}
            getSocket(state.players[pid]?.socketId)?.emit('battleVoid',{reason:'스테이지 시간 종료'});
          });
        }
      });
      // 대기 중 도전 취소
      Object.entries(state.pendingChallenges).forEach(([cId,oppId])=>{
        getSocket(state.players[oppId]?.socketId)?.emit('challengeCancelled');
        delete state.pendingChallenges[cId];
      });
      io.emit('stageEnd',{});
      emitRankings();
    }
  },1000);
}

function stopStageTimer(){
  if(state.stageTimer) clearInterval(state.stageTimer);
  state.stageTimer=null;
  state.stageActive=false;
  state.lockNew=false;
  state.stageRemaining=0;
  broadcastStageUpdate();
}

function broadcastStageUpdate(){
  io.emit('stageUpdate',{
    active:state.stageActive,
    remaining:state.stageRemaining,
    duration:state.stageDuration,
    lockNew:state.lockNew
  });
}

function startBattle(p1Id,p2Id){
  const qs=selectQuestions(5);
  const battleId=`${p1Id}_${p2Id}_${Date.now()}`;
  const rangeLabel=activeBlockLabel();
  state.battles[battleId]={id:battleId,players:[p1Id,p2Id],questions:qs,currentQ:0,scores:{[p1Id]:0,[p2Id]:0},qAnswers:{},qResolved:{},timer:null,status:'active',rangeLabel};
  state.players[p1Id].inBattle=true;
  state.players[p2Id].inBattle=true;
  sendQuestion(battleId,0);
  emitRankings();
}

function sendQuestion(battleId,qIdx){
  const battle=state.battles[battleId];
  if(!battle||battle.status!=='active')return;
  const q=battle.questions[qIdx];
  const payload={battleId,qIdx,question:q.q,options:q.opts,sector:1,sectorName:`OX 퀴즈 · ${battle.rangeLabel}`,scores:battle.scores,totalQ:battle.questions.length};
  battle.players.forEach(pid=>getSocket(state.players[pid]?.socketId)?.emit('battleQuestion',payload));
  if(battle.timer)clearTimeout(battle.timer);
  battle.timer=setTimeout(()=>resolveQuestion(battleId,qIdx,null),QUESTION_TIME_MS+600);
}

function resolveQuestion(battleId,qIdx,winnerId){
  const battle=state.battles[battleId];
  if(!battle||battle.qResolved[qIdx]||battle.status!=='active')return;
  battle.qResolved[qIdx]=true;
  if(battle.timer){clearTimeout(battle.timer);battle.timer=null;}
  const q=battle.questions[qIdx];
  const [p1,p2]=battle.players;
  if(winnerId){battle.scores[winnerId]++;state.players[winnerId].correct++;}
  const result={qIdx,winnerId,correctAnswer:q.ans,explanation:q.exp,scores:battle.scores,p1Id:p1,p2Id:p2,sector:1,sectorName:`OX 퀴즈 · ${battle.rangeLabel}`};
  battle.players.forEach(pid=>getSocket(state.players[pid]?.socketId)?.emit('questionResult',result));
  const s1=battle.scores[p1],s2=battle.scores[p2];
  const nextQ=qIdx+1;
  const isOver=s1>=3||s2>=3||nextQ>=battle.questions.length;
  if(isOver)setTimeout(()=>endBattle(battleId),3000);
  else{battle.currentQ=nextQ;setTimeout(()=>sendQuestion(battleId,nextQ),3000);}
}

function endBattle(battleId){
  const battle=state.battles[battleId];
  if(!battle||battle.status==='finished')return;
  battle.status='finished';
  const [p1,p2]=battle.players;
  const s1=battle.scores[p1],s2=battle.scores[p2];
  const winner=s1>s2?p1:s2>s1?p2:null;
  const multi = state.finalStage ? 3 : 1;  // 막판뒤집기 3배

  if(winner){
    state.players[winner].wins += multi;
    state.players[winner===p1?p2:p1].losses += multi;
  }
  battle.players.forEach(pid=>{
    const p=state.players[pid];
    p.total+=battle.questions.length;
    p.battled.push(pid===p1?p2:p1);
    p.inBattle=false;
  });
  battle.players.forEach(pid=>getSocket(state.players[pid]?.socketId)?.emit('battleEnd',{
    winner,finalScores:battle.scores,
    p1Id:p1,p2Id:p2,
    p1Name:state.players[p1].name,p2Name:state.players[p2].name,
    yourId:pid,sector:1,sectorName:`OX 퀴즈 · ${battle.rangeLabel}`,
    finalStage:state.finalStage,winMulti:multi
  }));
  emitRankings();
}

io.on('connection',(socket)=>{
  socket.on('register',({name,team})=>{
    const id=state.nextPlayerId++;
    state.players[id]={id,name:name.trim(),team:parseInt(team),socketId:socket.id,wins:0,losses:0,correct:0,total:0,battled:[],online:true,inBattle:false};
    socket.playerId=id;
    socket.emit('registered',{id,player:state.players[id]});
    emitSystemState(socket);
    emitRankings();
  });
  socket.on('reconnectPlayer',(id)=>{
    const p=state.players[id];
    if(p){p.socketId=socket.id;p.online=true;socket.playerId=id;
      socket.emit('reconnected',{player:p});
      emitSystemState(socket);
      emitRankings();}
    else socket.emit('reconnectFailed');
  });
  function doChallenge(socket, oppId){
    const me=state.players[socket.playerId],opp=state.players[oppId];
    if(!me||!opp)return socket.emit('challengeError','존재하지 않는 상대입니다.');
    if(oppId===socket.playerId)return socket.emit('challengeError','자기 자신에게 도전할 수 없습니다.');
    if(me.battled.includes(oppId)||opp.battled.includes(socket.playerId))return socket.emit('challengeError','이미 대결한 상대입니다.');
    if(me.inBattle)return socket.emit('challengeError','현재 대결 중입니다.');
    if(opp.inBattle)return socket.emit('challengeError','상대방이 현재 대결 중입니다.');
    if(state.lockNew)return socket.emit('challengeError','⏰ 스테이지 종료 20초 전입니다. 새 대결을 시작할 수 없습니다.');
    state.pendingChallenges[socket.playerId]=oppId;
    const os2=getSocket(opp.socketId);
    if(!os2)return socket.emit('challengeError','상대방이 현재 접속 중이 아닙니다.');
    os2.emit('challenged',{challengerId:me.id,challengerName:me.name,challengerTeam:me.team,finalStage:state.finalStage});
    socket.emit('challengeSent',{opponentId:oppId,opponentName:opp.name});
  }

  socket.on('challenge',(oppId)=>doChallenge(socket, oppId));

  // 이름으로 도전 — 동명이인이면 후보 목록 반환
  socket.on('challengeByName',(name)=>{
    const me=state.players[socket.playerId];
    if(!me)return socket.emit('challengeError','먼저 등록해주세요.');
    const q=String(name||'').trim();
    if(!q)return socket.emit('challengeError','상대방 이름을 입력해주세요.');
    const matches=Object.values(state.players).filter(p=>p.id!==socket.playerId && (p.name===q || p.name.includes(q)));
    if(matches.length===0)return socket.emit('challengeError',`"${q}" 이름의 참가자를 찾을 수 없습니다.`);
    if(matches.length===1)return doChallenge(socket, matches[0].id);
    // 동명이인 → 후보 목록 전송 (번호로 구분)
    socket.emit('challengeNameCandidates', matches.map(p=>({
      id:p.id, name:p.name, team:p.team, online:p.online, inBattle:p.inBattle,
      wins:p.wins, battled:p.battled.length
    })));
  });
  socket.on('acceptChallenge',(cId)=>{
    if(state.pendingChallenges[cId]!==socket.playerId)return;
    delete state.pendingChallenges[cId];
    startBattle(cId,socket.playerId);
  });
  socket.on('rejectChallenge',(cId)=>{
    const refuser = state.players[socket.playerId];
    const challenger = state.players[cId];
    delete state.pendingChallenges[cId];

    if(state.finalStage && refuser && challenger){
      // 막판뒤집기: 거부 = 자동 패배 + 총 승수×3 차감
      const penalty = refuser.wins * 3;
      refuser.wins = Math.max(0, refuser.wins - penalty);
      refuser.losses += 3;
      const msg = `⚡ 막판뒤집기 거부 패널티! ${refuser.name}의 승수 ${penalty}점 차감`;
      io.emit('systemAnnounce', msg);
      getSocket(refuser.socketId)?.emit('finalStagePenalty', {
        msg:`❌ 막판뒤집기 거부로 승수 ${penalty}점이 차감되었습니다!`,
        newWins: refuser.wins
      });
      emitRankings();
    }
    getSocket(challenger?.socketId)?.emit('challengeRejected',{
      opponentName: refuser?.name,
      finalStageAuto: state.finalStage
    });
  });

  socket.on('cancelChallenge',()=>{
    const oId=state.pendingChallenges[socket.playerId];
    if(oId){getSocket(state.players[oId]?.socketId)?.emit('challengeCancelled');delete state.pendingChallenges[socket.playerId];}
  });
  socket.on('submitAnswer',({battleId,qIdx,answer})=>{
    const battle=state.battles[battleId];
    if(!battle||battle.status!=='active'||battle.currentQ!==qIdx||battle.qResolved[qIdx])return;
    const pid=socket.playerId;
    const key=`${qIdx}_${pid}`;
    if(battle.qAnswers[key])return;
    const q=battle.questions[qIdx];
    const isCorrect=answer===q.ans;
    battle.qAnswers[key]={answer,time:Date.now(),correct:isCorrect};
    if(isCorrect){resolveQuestion(battleId,qIdx,pid);}
    else{
      const [p1,p2]=battle.players;
      const otherId=pid===p1?p2:p1;
      const otherAns=battle.qAnswers[`${qIdx}_${otherId}`];
      if(otherAns&&!otherAns.correct)resolveQuestion(battleId,qIdx,null);
    }
  });

  // ── 관리자 ──
  socket.on('adminAuth',(pw)=>{
    if(pw===ADMIN_PASSWORD){socket.isAdmin=true;socket.emit('adminAuthResult',{success:true});}
    else socket.emit('adminAuthResult',{success:false});
  });
  socket.on('adminGetQuestions',()=>{
    if(!socket.isAdmin)return;
    socket.emit('adminQuestions',{blocks:QUIZ_BLOCKS, activeBlocks:state.activeBlocks});
  });

  // 활성 블록(카테고리 순번) 지정 — 핵심 기능
  socket.on('adminSetActiveBlocks',(blocks)=>{
    if(!socket.isAdmin)return;
    const valid=(Array.isArray(blocks)?blocks:[]).map(Number).filter(b=>QUIZ_BLOCKS[b]).sort((a,b)=>a-b);
    state.activeBlocks=valid.length?valid:[...ALL_BLOCK_NOS];
    const poolCount=state.activeBlocks.reduce((s,b)=>s+(QUIZ_BLOCKS[b]?.questions.length||0),0);
    io.emit('activeBlocksChanged',{activeBlocks:state.activeBlocks, label:activeBlockLabel(), poolCount});
    socket.emit('adminMsg',`✅ 출제 범위 설정: ${activeBlockLabel()} (총 ${poolCount}문제 풀)`);
  });

  // JSON 업로드로 블록 전체 교체
  socket.on('adminImportQuestions',(newBlocks)=>{
    if(!socket.isAdmin)return;
    if(newBlocks&&typeof newBlocks==='object'&&!Array.isArray(newBlocks)){
      QUIZ_BLOCKS=newBlocks;
      socket.emit('adminQuestions',{blocks:QUIZ_BLOCKS, activeBlocks:state.activeBlocks});
      socket.emit('adminMsg','✅ 문제 블록 업로드 완료!');
    }
  });

  socket.on('getRankings',()=>socket.emit('playersUpdate',publicPlayers()));
  socket.on('getSystemState',()=>emitSystemState(socket));

  // 이름으로 번호 찾기
  socket.on('findByName',(name)=>{
    const found = Object.values(state.players).filter(p=>
      p.name.includes(name.trim()) || name.trim().includes(p.name)
    );
    socket.emit('findByNameResult', found.map(p=>({
      id:p.id, name:p.name, team:p.team, online:p.online
    })));
  });

  // 막판뒤집기 모드 ON/OFF
  socket.on('adminSetFinalStage',(active)=>{
    if(!socket.isAdmin)return;
    state.finalStage=!!active;
    if(!active){ stopStageTimer(); }
    const msg = active
      ? '🔥 막판뒤집기 스테이지 시작! 승수 ×3 적용!'
      : '✅ 막판뒤집기 스테이지 종료. 일반 모드로 복귀.';
    io.emit('systemAnnounce', msg);
    emitFinalStage();
    socket.emit('adminMsg', msg);
  });

  // 참가자가 직접 거부자 이름 신고
  socket.on('reportRefuser',({refuserName})=>{
    const reporter = state.players[socket.playerId];
    if(!reporter) return;
    const refuser = Object.values(state.players).find(p=>p.name===refuserName.trim());
    if(!refuser){socket.emit('reportResult',{success:false,msg:`"${refuserName}" 이름을 찾을 수 없습니다.`});return;}
    if(!state.finalStage){socket.emit('reportResult',{success:false,msg:'막판뒤집기 모드가 아닙니다.'});return;}
    const penalty = refuser.wins * 3;
    refuser.wins = Math.max(0, refuser.wins - penalty);
    refuser.losses += 3;
    const msg = `⚡ ${reporter.name}이(가) 신고: ${refuser.name}이 막판뒤집기 거부! 승수 ${penalty}점 차감!`;
    io.emit('systemAnnounce', msg);
    getSocket(refuser.socketId)?.emit('finalStagePenalty',{
      msg:`❌ ${reporter.name}에게 막판뒤집기 거부 신고를 받았습니다. 승수 ${penalty}점 차감.`,
      newWins: refuser.wins
    });
    emitRankings();
    socket.emit('reportResult',{success:true, msg:`✅ ${refuser.name} 패널티 적용 완료! (${penalty}점 차감)`});
  });

  // 관리자: 스테이지 타이머 시작
  socket.on('adminStartStage',({minutes})=>{
    if(!socket.isAdmin)return;
    startStageTimer(minutes||7);
    socket.emit('adminMsg',`✅ 스테이지 타이머 시작! ${minutes||7}분`);
  });
  // 관리자: 타이머 중지
  socket.on('adminStopStage',()=>{
    if(!socket.isAdmin)return;
    stopStageTimer();
    socket.emit('adminMsg','⏹ 스테이지 타이머 중지');
  });
  // 관리자: 타이머 시간 설정만 (시작 X)
  socket.on('adminSetStageDuration',({minutes})=>{
    if(!socket.isAdmin)return;
    state.stageDuration=(minutes||7)*60;
    socket.emit('adminMsg',`⏱ 스테이지 기본 시간: ${minutes||7}분`);
  });
  socket.on('adminPenalizeRefuser',(playerName)=>{
    if(!socket.isAdmin)return;
    const p = Object.values(state.players).find(p=>p.name===playerName.trim());
    if(!p){socket.emit('adminMsg',`❌ "${playerName}" 이름의 참가자를 찾을 수 없습니다.`);return;}
    const penalty = p.wins * 3;
    p.wins = Math.max(0, p.wins - penalty);
    p.losses += 3;
    const msg = `⚡ [수동패널티] ${p.name}(${p.id}번) — 승수 ${penalty}점 차감, 패배 3추가`;
    io.emit('systemAnnounce', msg);
    getSocket(p.socketId)?.emit('finalStagePenalty',{
      msg:`❌ 관리자가 막판뒤집기 거부 패널티를 적용했습니다. 승수 ${penalty}점 차감.`,
      newWins: p.wins
    });
    emitRankings();
    socket.emit('adminMsg', msg);
  });

  socket.on('resetScores',()=>{
    if(!socket.isAdmin)return;
    Object.values(state.battles).forEach(b=>{if(b.timer)clearTimeout(b.timer);});
    state.battles={};state.pendingChallenges={};state.finalStage=false;
    Object.values(state.players).forEach(p=>{p.wins=0;p.losses=0;p.correct=0;p.total=0;p.battled=[];p.inBattle=false;});
    io.emit('scoresReset');io.emit('finalStageChanged',{active:false});emitRankings();
  });

  socket.on('resetAll',()=>{
    if(!socket.isAdmin)return;
    Object.values(state.battles).forEach(b=>{if(b.timer)clearTimeout(b.timer);});
    state.players={};state.battles={};state.pendingChallenges={};state.nextPlayerId=1;state.finalStage=false;
    io.emit('serverReset');io.emit('finalStageChanged',{active:false});emitRankings();
  });

  // ── 재시작 (카운트다운 후 전체 초기화 + 참가자 등록화면으로 이동) ──
  socket.on('adminRestart',({label})=>{
    if(!socket.isAdmin)return;
    const tag = label||'재시작';
    // 3초 카운트다운 공지 후 초기화
    io.emit('restartCountdown',{label:tag, sec:3});
    let cnt=3;
    const tick=setInterval(()=>{
      cnt--;
      if(cnt>0){
        io.emit('restartCountdown',{label:tag, sec:cnt});
      } else {
        clearInterval(tick);
        // 전체 상태 초기화
        Object.values(state.battles).forEach(b=>{if(b.timer)clearTimeout(b.timer);});
        state.players={};state.battles={};state.pendingChallenges={};
        state.nextPlayerId=1;state.finalStage=false;
        io.emit('serverRestart',{label:tag});
        io.emit('finalStageChanged',{active:false});
        emitRankings();
      }
    },1000);
  });
  socket.on('disconnect',()=>{
    const pid = socket.playerId;
    if(pid && state.players[pid]) state.players[pid].online=false;

    // 내가 건 도전 정리
    const oId=state.pendingChallenges[pid];
    if(oId){
      getSocket(state.players[oId]?.socketId)?.emit('challengeCancelled');
      delete state.pendingChallenges[pid];
    }
    // 나를 대상으로 한 도전 정리 (내가 도전 대상이었던 경우)
    Object.entries(state.pendingChallenges).forEach(([cId, targetId])=>{
      if(parseInt(targetId)===pid){
        getSocket(state.players[cId]?.socketId)?.emit('challengeCancelled');
        delete state.pendingChallenges[cId];
      }
    });

    emitRankings();
    // 대결 중 끊김은 즉시 종료하지 않음 - socket.io 자동 재연결 + reconnectPlayer로 복구.
    // 끝내 복구 안 되면 6초 타이머가 문항을 자동 진행시켜 대결이 정상 종료됨.
  });
});

app.use(express.static(path.join(__dirname,'public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

server.listen(PORT,'0.0.0.0',()=>{
  const nets=os.networkInterfaces();
  console.log('\n========================================');
  console.log('🏦  새마을금고 퀴즈 대결 서버 시작!');
  console.log('========================================');
  Object.values(nets).flat().filter(n=>n.family==='IPv4'&&!n.internal).forEach(n=>console.log(`   👉  http://${n.address}:${PORT}`));
  console.log(`\n🔐  관리자 비밀번호: ${ADMIN_PASSWORD}`);
  console.log('========================================\n');
});
