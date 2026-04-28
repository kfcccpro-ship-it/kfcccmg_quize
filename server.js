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

// ===== 퀴즈 DB (let — 관리자가 수정 가능) =====
let QUIZ_DB = {
  1: [ // OX 퀴즈 90문제
    // ── 기본 법인·감독 ──
    {q:"새마을금고의 주무 감독관청은 행정안전부이다.",opts:["O","X"],ans:"O",exp:"새마을금고는 행정안전부장관의 지도·감독을 받습니다."},
    {q:"새마을금고는 영리를 목적으로 하는 법인이다.",opts:["O","X"],ans:"X",exp:"새마을금고는 비영리법인입니다."},
    {q:"피성년후견인은 새마을금고 회원이 될 수 없다.",opts:["O","X"],ans:"O",exp:"피성년후견인은 새마을금고 회원 자격이 없습니다."},
    {q:"새마을금고법은 1983년 1월 1일 법률 제3622호로 제정되었다.",opts:["O","X"],ans:"O",exp:"새마을금고법은 1983년 1월 1일 법률 제3622호로 제정되었습니다."},
    {q:"회원의 출자금에는 질권을 설정할 수 없다.",opts:["O","X"],ans:"O",exp:"새마을금고법은 출자금에 대한 질권 설정을 금지합니다."},
    {q:"새마을금고 설립은 허가주의를 채택하고 있다.",opts:["O","X"],ans:"X",exp:"새마을금고는 허가주의가 아닌 인가주의를 채택합니다."},
    {q:"파산선고를 받은 자는 새마을금고 회원에서 당연 탈퇴된다.",opts:["O","X"],ans:"O",exp:"파산선고는 당연 탈퇴 사유입니다."},
    {q:"새마을금고 감사는 필요 시 임시총회를 소집할 수 있다.",opts:["O","X"],ans:"O",exp:"감사는 임시총회 소집권을 가집니다."},
    {q:"외국인은 새마을금고 회원이 될 수 없다.",opts:["O","X"],ans:"X",exp:"외국인도 자격요건을 갖추면 새마을금고 회원이 될 수 있습니다."},
    {q:"새마을금고의 최고의결기관은 총회이다.",opts:["O","X"],ans:"O",exp:"새마을금고의 최고의결기관은 총회입니다."},
    {q:"이사장은 새마을금고를 대표한다.",opts:["O","X"],ans:"O",exp:"이사장은 새마을금고의 대표자입니다."},
    {q:"새마을금고는 어음할인 업무를 할 수 있다.",opts:["O","X"],ans:"O",exp:"어음할인은 새마을금고의 신용사업에 포함됩니다."},
    {q:"회원이 사망하면 새마을금고에서 당연 탈퇴된다.",opts:["O","X"],ans:"O",exp:"사망은 당연 탈퇴 사유입니다."},
    {q:"새마을금고의 회계연도는 1월 1일부터 12월 31일까지이다.",opts:["O","X"],ans:"O",exp:"새마을금고의 회계연도는 1월 1일부터 12월 31일까지입니다."},
    {q:"새마을금고 설립 시 반드시 창립총회를 개최해야 한다.",opts:["O","X"],ans:"O",exp:"창립총회 개최는 새마을금고 설립절차의 필수 단계입니다."},
    {q:"새마을금고 잉여금 배당에는 출자배당과 이용고배당이 있다.",opts:["O","X"],ans:"O",exp:"잉여금 배당은 출자배당과 이용고배당으로 이루어집니다."},
    {q:"비회원은 새마을금고 사업을 어떤 경우에도 이용할 수 없다.",opts:["O","X"],ans:"X",exp:"비회원도 일정 범위 내에서 새마을금고 사업을 이용할 수 있습니다."},
    {q:"새마을금고 정관변경은 총회의 특별결의로 한다.",opts:["O","X"],ans:"O",exp:"정관변경은 총회의 특별결의 사항입니다."},
    {q:"새마을금고는 사단법인이다.",opts:["O","X"],ans:"O",exp:"새마을금고는 사단법인입니다."},
    {q:"미성년자는 새마을금고 회원이 될 수 없다.",opts:["O","X"],ans:"X",exp:"미성년자도 자격요건을 갖추면 새마을금고 회원이 될 수 있습니다."},
    {q:"새마을금고 임원에는 이사장, 이사, 감사가 있다.",opts:["O","X"],ans:"O",exp:"새마을금고 임원은 이사장, 이사, 감사로 구성됩니다."},
    {q:"회원은 출자금을 타인에게 양도할 수 있다.",opts:["O","X"],ans:"O",exp:"출자금은 타인에게 양도·양수할 수 있습니다."},
    {q:"새마을금고 회원은 1인 1표의 의결권을 가진다.",opts:["O","X"],ans:"O",exp:"새마을금고는 1인 1표 원칙을 채택합니다."},
    {q:"새마을금고는 공제사업을 운영할 수 있다.",opts:["O","X"],ans:"O",exp:"공제사업은 새마을금고의 사업 범위에 포함됩니다."},
    {q:"새마을금고의 합병은 총회 의결 없이 이사회만으로 결정할 수 있다.",opts:["O","X"],ans:"X",exp:"합병은 총회 의결이 필요합니다."},
    {q:"새마을금고중앙회는 금고에 대한 검사권을 가진다.",opts:["O","X"],ans:"O",exp:"중앙회는 금고를 검사할 권한을 가집니다."},
    {q:"새마을금고법은 민법에 대하여 특별법적 지위를 가진다.",opts:["O","X"],ans:"O",exp:"새마을금고법은 민법에 대해 특별법입니다."},
    {q:"새마을금고의 해산은 이사장이 단독으로 결정할 수 있다.",opts:["O","X"],ans:"X",exp:"해산은 총회 의결이 필요합니다."},
    {q:"새마을금고 회원은 출자금을 상계(相計)할 수 없다.",opts:["O","X"],ans:"O",exp:"새마을금고법은 출자금에 대한 상계를 금지합니다."},
    {q:"새마을금고 대의원의 임기는 2년이다.",opts:["O","X"],ans:"O",exp:"새마을금고 대의원의 임기는 2년입니다."},
    // ── 추가 60문제 ──
    {q:"새마을금고는 금융위원회의 감독을 받는다.",opts:["O","X"],ans:"X",exp:"새마을금고는 금융위원회가 아닌 행정안전부장관의 감독을 받습니다."},
    {q:"새마을금고 이사장의 임기는 4년이다.",opts:["O","X"],ans:"X",exp:"새마을금고 이사장의 임기는 2년입니다."},
    {q:"새마을금고 이사장의 임기는 2년이다.",opts:["O","X"],ans:"O",exp:"새마을금고 이사장의 임기는 2년입니다."},
    {q:"새마을금고 감사의 임기는 이사장과 동일하게 2년이다.",opts:["O","X"],ans:"O",exp:"새마을금고 감사의 임기도 2년입니다."},
    {q:"새마을금고 이사의 임기는 3년이다.",opts:["O","X"],ans:"X",exp:"새마을금고 이사의 임기는 2년입니다."},
    {q:"새마을금고 임원은 연임이 가능하다.",opts:["O","X"],ans:"O",exp:"새마을금고 임원은 연임할 수 있습니다."},
    {q:"새마을금고는 법인격이 없는 임의단체이다.",opts:["O","X"],ans:"X",exp:"새마을금고는 법인격을 가진 사단법인입니다."},
    {q:"새마을금고의 회원은 출자자이다.",opts:["O","X"],ans:"O",exp:"새마을금고 회원은 출자를 통해 가입하는 출자자입니다."},
    {q:"새마을금고법은 상법에 대한 특별법이다.",opts:["O","X"],ans:"X",exp:"새마을금고법은 민법에 대한 특별법입니다. 상법이 아닙니다."},
    {q:"새마을금고는 예금자보호법의 적용을 받지 않는다.",opts:["O","X"],ans:"O",exp:"새마을금고는 예금자보호법이 아닌 새마을금고법에 의해 자체 보호 제도를 운영합니다."},
    {q:"새마을금고의 출자 1좌의 금액은 정관으로 정한다.",opts:["O","X"],ans:"O",exp:"출자 1좌의 금액은 정관에서 정합니다."},
    {q:"새마을금고 회원은 의결권과 선거권을 가진다.",opts:["O","X"],ans:"O",exp:"새마을금고 회원은 의결권과 선거권을 가집니다."},
    {q:"새마을금고 회원은 출자좌수에 비례하여 의결권을 행사한다.",opts:["O","X"],ans:"X",exp:"새마을금고 회원은 출자좌수와 관계없이 1인 1표의 의결권을 가집니다."},
    {q:"새마을금고의 정기총회는 매년 2회 개최한다.",opts:["O","X"],ans:"X",exp:"새마을금고의 정기총회는 매년 1회 개최합니다."},
    {q:"새마을금고의 정기총회는 매년 1회 개최한다.",opts:["O","X"],ans:"O",exp:"새마을금고의 정기총회는 매년 1회 개최합니다."},
    {q:"새마을금고 총회는 재적회원 과반수 출석으로 개의한다.",opts:["O","X"],ans:"O",exp:"총회는 재적회원 과반수의 출석으로 개의합니다."},
    {q:"새마을금고 총회 의결은 출석회원 과반수 찬성으로 한다.",opts:["O","X"],ans:"O",exp:"총회 의결은 출석회원 과반수 찬성이 원칙입니다."},
    {q:"새마을금고 특별결의는 재적회원 과반수 출석, 출석회원 3분의 2 이상 찬성이다.",opts:["O","X"],ans:"O",exp:"특별결의는 재적회원 과반수 출석, 출석회원 3분의 2 이상 찬성이 필요합니다."},
    {q:"정관변경은 총회의 보통결의로 가능하다.",opts:["O","X"],ans:"X",exp:"정관변경은 총회의 특별결의(출석 3분의 2 이상)가 필요합니다."},
    {q:"새마을금고의 해산 결의는 총회 특별결의로 한다.",opts:["O","X"],ans:"O",exp:"해산은 총회의 특별결의가 필요합니다."},
    {q:"새마을금고 회원이 3개월 이상 연속하여 출자금을 납입하지 않으면 당연 탈퇴된다.",opts:["O","X"],ans:"X",exp:"출자금 미납은 당연 탈퇴 사유가 아니라 제명 사유에 해당할 수 있습니다."},
    {q:"새마을금고 회원의 탈퇴는 예고 없이 언제든지 가능하다.",opts:["O","X"],ans:"X",exp:"회원 탈퇴는 회계연도 말일까지 예고 후 탈퇴하는 것이 원칙입니다."},
    {q:"회원이 피성년후견인이 되면 당연 탈퇴된다.",opts:["O","X"],ans:"O",exp:"피성년후견인 선고는 당연 탈퇴 사유입니다."},
    {q:"새마을금고 임원은 금고의 직원을 겸직할 수 없다.",opts:["O","X"],ans:"X",exp:"이사장은 직원을 겸직할 수 없으나, 모든 임원에게 동일하게 적용되는 것은 아닙니다."},
    {q:"새마을금고 이사장은 이사회의 의장이 된다.",opts:["O","X"],ans:"O",exp:"이사장은 이사회를 소집하고 의장이 됩니다."},
    {q:"새마을금고 이사회는 이사 전원의 출석으로 개의한다.",opts:["O","X"],ans:"X",exp:"이사회는 이사 과반수의 출석으로 개의합니다."},
    {q:"새마을금고 감사는 이사회에 출석하여 의견을 진술할 수 있다.",opts:["O","X"],ans:"O",exp:"감사는 이사회에 출석하여 의견을 진술할 수 있는 권한이 있습니다."},
    {q:"새마을금고 감사는 직무를 수행하기 위해 언제든지 금고의 장부나 서류를 열람할 수 있다.",opts:["O","X"],ans:"O",exp:"감사는 언제든지 장부·서류를 열람하고 재산상황을 조사할 수 있습니다."},
    {q:"새마을금고는 결산 후 잉여금이 없으면 배당을 실시하지 않을 수 있다.",opts:["O","X"],ans:"O",exp:"잉여금이 없는 경우 배당을 실시할 수 없습니다."},
    {q:"새마을금고의 법정준비금은 매 회계연도 잉여금의 20분의 1 이상을 적립한다.",opts:["O","X"],ans:"X",exp:"법정준비금은 매 회계연도 잉여금의 10분의 1 이상을 적립해야 합니다."},
    {q:"새마을금고의 법정준비금은 매 회계연도 잉여금의 10분의 1 이상을 적립한다.",opts:["O","X"],ans:"O",exp:"법정준비금은 매 회계연도 잉여금의 10분의 1 이상을 적립해야 합니다."},
    {q:"새마을금고는 회원에게 예탁금을 받을 수 있다.",opts:["O","X"],ans:"O",exp:"예탁금 수납은 새마을금고의 신용사업 중 하나입니다."},
    {q:"새마을금고는 비회원에게는 어떠한 경우에도 대출을 할 수 없다.",opts:["O","X"],ans:"X",exp:"새마을금고는 일정 범위 내에서 비회원에게도 대출을 할 수 있습니다."},
    {q:"새마을금고는 부동산을 취득하여 임대사업을 영위할 수 있다.",opts:["O","X"],ans:"X",exp:"새마을금고는 업무용 부동산 이외에 임대목적 부동산 취득은 제한됩니다."},
    {q:"새마을금고는 내부감사 외에 외부감사도 받을 수 있다.",opts:["O","X"],ans:"O",exp:"새마을금고는 내부 감사 외에 외부 감사를 받을 수 있습니다."},
    {q:"새마을금고중앙회는 금고의 업무·자산 및 회계를 감사할 수 있다.",opts:["O","X"],ans:"O",exp:"중앙회는 금고에 대해 업무·자산·회계 감사 권한을 가집니다."},
    {q:"행정안전부장관은 새마을금고에 대해 업무정지 명령을 내릴 수 있다.",opts:["O","X"],ans:"O",exp:"행정안전부장관은 금고에 대한 업무정지 명령 권한을 가집니다."},
    {q:"새마을금고의 설립인가가 취소되면 즉시 소멸된다.",opts:["O","X"],ans:"X",exp:"설립인가 취소 시 해산하고 청산 절차를 거쳐야 합니다."},
    {q:"새마을금고 청산인은 현존 사무를 종결할 권한을 가진다.",opts:["O","X"],ans:"O",exp:"청산인은 현존 사무 종결, 채권 추심, 채무 변제 등의 직무를 수행합니다."},
    {q:"새마을금고가 해산하면 잔여재산은 국가에 귀속된다.",opts:["O","X"],ans:"X",exp:"잔여재산은 정관이 정하는 바에 따라 처리하며, 정관에 규정이 없으면 중앙회에 귀속됩니다."},
    {q:"새마을금고의 합병은 흡수합병만 가능하다.",opts:["O","X"],ans:"X",exp:"새마을금고는 흡수합병과 신설합병 모두 가능합니다."},
    {q:"새마을금고 분할은 새마을금고법에서 허용하지 않는다.",opts:["O","X"],ans:"O",exp:"새마을금고법은 분할에 관한 규정을 두고 있지 않습니다."},
    {q:"새마을금고중앙회는 새마을금고법에 의해 설립된 법인이다.",opts:["O","X"],ans:"O",exp:"새마을금고중앙회는 새마을금고법에 근거하여 설립된 법인입니다."},
    {q:"새마을금고중앙회의 회원은 개인이다.",opts:["O","X"],ans:"X",exp:"새마을금고중앙회의 회원은 개인이 아닌 각 새마을금고입니다."},
    {q:"새마을금고는 중앙회에 가입하지 않아도 된다.",opts:["O","X"],ans:"X",exp:"새마을금고는 설립 후 의무적으로 중앙회에 가입해야 합니다."},
    {q:"새마을금고 임원이 법령을 위반하면 행정안전부장관이 해임 요구를 할 수 있다.",opts:["O","X"],ans:"O",exp:"행정안전부장관은 법령 위반 임원에 대해 해임 요구를 할 수 있습니다."},
    {q:"새마을금고는 동일인에게 자기자본의 100분의 20을 초과하여 대출할 수 없다.",opts:["O","X"],ans:"O",exp:"동일인 대출 한도는 자기자본의 100분의 20입니다."},
    {q:"새마을금고 임원이 결원인 경우 지체 없이 보선해야 한다.",opts:["O","X"],ans:"O",exp:"임원 결원 시 지체 없이 보선해야 합니다."},
    {q:"새마을금고 직원은 이사회에서 임면한다.",opts:["O","X"],ans:"X",exp:"직원은 이사장이 임면합니다."},
    {q:"새마을금고 지배인은 이사장이 임면한다.",opts:["O","X"],ans:"O",exp:"지배인은 이사장이 임면하며 업무를 대행합니다."},
    {q:"새마을금고의 공제사업에서 지급하는 금액도 예금자보호 대상이다.",opts:["O","X"],ans:"X",exp:"공제 지급금은 예금자보호 대상이 아닙니다."},
    {q:"새마을금고 회원은 총회에서 임원을 선출할 권리가 있다.",opts:["O","X"],ans:"O",exp:"회원은 총회에서 임원을 선출하는 선거권을 가집니다."},
    {q:"새마을금고 창립총회는 발기인이 소집한다.",opts:["O","X"],ans:"O",exp:"새마을금고 창립총회는 발기인이 소집합니다."},
    {q:"새마을금고 설립 시 최소 출자자 수에 대한 제한이 없다.",opts:["O","X"],ans:"X",exp:"새마을금고 설립을 위해서는 일정 수 이상의 회원이 필요합니다."},
    {q:"새마을금고는 비영리법인이지만 이익을 창출할 수 있다.",opts:["O","X"],ans:"O",exp:"비영리법인도 이익을 창출할 수 있으며, 다만 이익을 구성원에게 배분하는 것이 주목적이 아닌 법인입니다."},
    {q:"새마을금고 이사장은 총회에서 선출한다.",opts:["O","X"],ans:"O",exp:"이사장은 총회에서 회원이 직접 선출합니다."},
    {q:"새마을금고의 이사는 이사장이 임명한다.",opts:["O","X"],ans:"X",exp:"이사는 총회에서 선출합니다."},
    {q:"새마을금고 대의원회는 대의원으로 구성된다.",opts:["O","X"],ans:"O",exp:"대의원회는 회원 중에서 선출된 대의원으로 구성됩니다."},
    {q:"대의원회는 총회의 권한을 대신할 수 있다.",opts:["O","X"],ans:"O",exp:"회원 수가 많은 경우 대의원회가 총회에 갈음할 수 있습니다."},
    {q:"새마을금고의 출자금은 회원 탈퇴 시 즉시 반환된다.",opts:["O","X"],ans:"X",exp:"탈퇴 회원의 출자금은 해당 회계연도 결산 후 반환됩니다."},
    {q:"새마을금고 회원이 자발적으로 탈퇴하면 지분 환급을 청구할 수 있다.",opts:["O","X"],ans:"O",exp:"탈퇴 회원은 지분 환급을 청구할 수 있습니다."},
    {q:"새마을금고 신용사업에는 보험업무가 포함된다.",opts:["O","X"],ans:"X",exp:"보험은 포함되지 않으며, 공제사업이 별도로 존재합니다."},
    {q:"새마을금고는 국가로부터 재정 지원을 받을 수 있다.",opts:["O","X"],ans:"O",exp:"새마을금고는 국가 또는 지방자치단체로부터 재정 지원을 받을 수 있습니다."},
    {q:"새마을금고는 지역주민만 가입할 수 있다.",opts:["O","X"],ans:"X",exp:"지역금고 외에도 직장금고 등 다양한 형태가 있으며, 가입 자격은 금고 유형에 따라 다릅니다."},
    {q:"새마을금고는 조합원의 경제적 이익을 위한 협동조합 성격을 가진다.",opts:["O","X"],ans:"O",exp:"새마을금고는 협동조합적 성격의 서민 금융기관입니다."},
    {q:"행정안전부장관은 새마을금고 설립 인가를 거부할 수 없다.",opts:["O","X"],ans:"X",exp:"행정안전부장관은 요건 미충족 시 설립 인가를 거부할 수 있습니다."},
    {q:"새마을금고 임원의 겸직 제한은 정관으로만 정할 수 있다.",opts:["O","X"],ans:"X",exp:"임원의 겸직 제한은 새마을금고법에서 규정합니다."},
  ],
  2: [ // 3지선다 75문제
    {q:"새마을금고의 지도·감독 주무관청은?",opts:["금융위원회","행정안전부","기획재정부"],ans:"행정안전부",exp:"새마을금고는 행정안전부장관의 지도·감독을 받습니다."},
    {q:"새마을금고법 제정 연도는?",opts:["1980년","1983년","1986년"],ans:"1983년",exp:"새마을금고법은 1983년 1월 1일 제정되었습니다."},
    {q:"새마을금고 회원이 될 수 없는 자는?",opts:["외국인","미성년자","피성년후견인"],ans:"피성년후견인",exp:"피성년후견인은 새마을금고 회원 자격이 없습니다."},
    {q:"새마을금고의 법인 성격으로 옳지 않은 것은?",opts:["사단법인","비영리법인","영리법인"],ans:"영리법인",exp:"새마을금고는 비영리법인입니다."},
    {q:"새마을금고 설립에 적용되는 입법주의는?",opts:["허가주의","인가주의","준칙주의"],ans:"인가주의",exp:"새마을금고는 인가주의에 따라 설립됩니다."},
    {q:"새마을금고 총회의 종류 중 옳지 않은 것은?",opts:["정기총회","임시총회","특별총회"],ans:"특별총회",exp:"총회는 정기총회와 임시총회로만 구분됩니다."},
    {q:"회원의 소수회원권이 아닌 것은?",opts:["총회소집요구권","임원해임요구권","사업이용권"],ans:"사업이용권",exp:"사업이용권은 자익권이며, 소수회원권이 아닙니다."},
    {q:"새마을금고 잉여금 배당의 종류가 아닌 것은?",opts:["출자배당","이용고배당","균등배당"],ans:"균등배당",exp:"잉여금 배당은 출자배당과 이용고배당으로만 이루어집니다."},
    {q:"새마을금고 감사의 권한이 아닌 것은?",opts:["재산상황 감사권","총회소집권","직원 임면권"],ans:"직원 임면권",exp:"감사는 직원 임면권을 가지지 않습니다."},
    {q:"새마을금고의 사업이 아닌 것은?",opts:["예탁금·적금 수납","자금 대출","주식 발행"],ans:"주식 발행",exp:"새마을금고는 주식을 발행할 수 없습니다."},
    {q:"회원의 당연 탈퇴 사유가 아닌 것은?",opts:["사망","파산선고","장기 연체"],ans:"장기 연체",exp:"장기 연체는 당연 탈퇴가 아닌 제명 사유입니다."},
    {q:"새마을금고의 최고의결기관은?",opts:["이사회","총회","감사위원회"],ans:"총회",exp:"새마을금고의 최고의결기관은 총회입니다."},
    {q:"새마을금고 회원의 의결권은?",opts:["출자좌수 비례","1인 1표","자산 비례"],ans:"1인 1표",exp:"새마을금고는 1인 1표 원칙을 따릅니다."},
    {q:"새마을금고의 회계연도는?",opts:["4월 1일~3월 31일","1월 1일~12월 31일","7월 1일~6월 30일"],ans:"1월 1일~12월 31일",exp:"회계연도는 1월 1일부터 12월 31일까지입니다."},
    {q:"새마을금고법에서 가장 무거운 형벌의 최고 형량은?",opts:["3년 이하 징역","5년 이하 징역","7년 이하 징역"],ans:"5년 이하 징역",exp:"새마을금고법의 최고 형벌은 5년 이하 징역 또는 5천만원 이하 벌금입니다."},
    {q:"새마을금고 대의원의 임기는?",opts:["1년","2년","3년"],ans:"2년",exp:"대의원의 임기는 2년입니다."},
    {q:"새마을금고의 해산 사유가 아닌 것은?",opts:["총회의 해산의결","이사장의 해산 선언","설립인가 취소"],ans:"이사장의 해산 선언",exp:"이사장 단독으로 해산을 결정할 수 없습니다."},
    {q:"출자금에 대해 허용되는 것은?",opts:["질권 설정","상계","상속"],ans:"상속",exp:"출자금은 상속이 가능하지만, 질권 설정과 상계는 금지됩니다."},
    {q:"새마을금고 정관의 절대적 기재사항이 아닌 것은?",opts:["목적","명칭","임원의 보수"],ans:"임원의 보수",exp:"임원의 보수는 절대적 기재사항이 아닙니다."},
    {q:"새마을금고 청산 시 청산인의 직무가 아닌 것은?",opts:["채무 변제","잔여재산 인도","새 회원 가입 처리"],ans:"새 회원 가입 처리",exp:"청산 중에는 새로운 영업이나 회원 가입을 처리하지 않습니다."},
    {q:"새마을금고 이사회 소집권자는?",opts:["이사장","감사","중앙회장"],ans:"이사장",exp:"이사회는 이사장이 소집합니다."},
    {q:"새마을금고 예금자보호준비금의 관리 기관은?",opts:["예금보험공사","새마을금고중앙회","행정안전부"],ans:"새마을금고중앙회",exp:"예금자보호준비금은 새마을금고중앙회에 설치됩니다."},
    {q:"새마을금고 회원의 공익권이 아닌 것은?",opts:["의결권","선거권","사업이용권"],ans:"사업이용권",exp:"사업이용권은 자익권입니다."},
    {q:"새마을금고 합병 시 필요한 것은?",opts:["이사회 의결만으로 가능","총회 의결이 필요","감사의 동의만으로 가능"],ans:"총회 의결이 필요",exp:"합병은 총회의 의결을 거쳐야 합니다."},
    {q:"이사장과 금고 간 소송에서 금고를 대표하는 자는?",opts:["부이사장","감사","중앙회장"],ans:"감사",exp:"이사장과 금고 간 소송에서는 감사가 금고를 대표합니다."},
    // ── 추가 50문제 ──
    {q:"새마을금고 이사장의 임기는?",opts:["1년","2년","3년"],ans:"2년",exp:"새마을금고 이사장의 임기는 2년입니다."},
    {q:"새마을금고 이사의 임기는?",opts:["1년","2년","4년"],ans:"2년",exp:"새마을금고 이사의 임기도 2년입니다."},
    {q:"새마을금고 감사의 임기는?",opts:["1년","2년","3년"],ans:"2년",exp:"새마을금고 감사의 임기도 2년입니다."},
    {q:"새마을금고 법정준비금은 잉여금의 얼마 이상을 적립해야 하나?",opts:["5분의 1","10분의 1","20분의 1"],ans:"10분의 1",exp:"법정준비금은 매 회계연도 잉여금의 10분의 1 이상을 적립합니다."},
    {q:"새마을금고 이사회 의결 정족수는?",opts:["이사 전원 찬성","이사 과반수 출석·과반수 찬성","이사 3분의 2 출석·과반수 찬성"],ans:"이사 과반수 출석·과반수 찬성",exp:"이사회는 이사 과반수 출석과 출석이사 과반수 찬성으로 의결합니다."},
    {q:"새마을금고 총회 특별결의 요건은?",opts:["재적 과반수 출석·출석 과반수 찬성","재적 과반수 출석·출석 3분의 2 찬성","재적 3분의 2 출석·출석 과반수 찬성"],ans:"재적 과반수 출석·출석 3분의 2 찬성",exp:"특별결의는 재적 과반수 출석, 출석회원 3분의 2 이상 찬성입니다."},
    {q:"새마을금고 정기총회 개최 시기는?",opts:["매년 1회","매년 2회","분기마다"],ans:"매년 1회",exp:"정기총회는 매년 1회 개최합니다."},
    {q:"새마을금고 소수회원 총회소집 요구 요건은?",opts:["재적회원 5분의 1 이상","재적회원 10분의 1 이상","재적회원 3분의 1 이상"],ans:"재적회원 5분의 1 이상",exp:"재적회원 5분의 1 이상의 연서로 총회 소집을 요구할 수 있습니다."},
    {q:"새마을금고 임원 해임 요구권을 행사할 수 있는 회원 수는?",opts:["재적회원 5분의 1 이상","재적회원 10분의 1 이상","재적회원 3분의 1 이상"],ans:"재적회원 5분의 1 이상",exp:"재적회원 5분의 1 이상이 연서하면 임원 해임을 요구할 수 있습니다."},
    {q:"새마을금고의 주소는 어디에 두는가?",opts:["이사장 주소지","주된 사무소 소재지","중앙회 소재지"],ans:"주된 사무소 소재지",exp:"새마을금고의 주소는 주된 사무소 소재지에 둡니다."},
    {q:"새마을금고 출자금을 탈퇴 회원에게 환급하는 시기는?",opts:["탈퇴 즉시","해당 회계연도 결산 후","다음 회계연도 결산 후"],ans:"해당 회계연도 결산 후",exp:"출자금은 탈퇴한 회계연도 결산 후 환급합니다."},
    {q:"새마을금고 창립총회를 소집하는 자는?",opts:["이사장","발기인","행정안전부장관"],ans:"발기인",exp:"창립총회는 발기인이 소집합니다."},
    {q:"새마을금고법에서 규정한 감사의 특별한 대표 권한이 적용되는 상황은?",opts:["이사장 해외 출장 시","이사장과 금고 간 소송 시","이사회 의결 시"],ans:"이사장과 금고 간 소송 시",exp:"이사장과 금고 간 소송에서는 감사가 금고를 대표합니다."},
    {q:"새마을금고 임시총회 소집 사유가 아닌 것은?",opts:["감사의 요구","재적회원 5분의 1 이상의 요구","행정안전부장관의 명령"],ans:"행정안전부장관의 명령",exp:"행정안전부장관의 명령은 임시총회 소집 사유가 아닙니다."},
    {q:"새마을금고 임원이 법령 위반 시 해임 요구를 할 수 있는 기관은?",opts:["중앙회","행정안전부장관","법원"],ans:"행정안전부장관",exp:"행정안전부장관이 법령 위반 임원에 대해 해임 요구를 할 수 있습니다."},
    {q:"새마을금고가 비회원에게 대출을 할 수 있는 최대 비율은?",opts:["전체 대출금의 10분의 1","전체 대출금의 5분의 1","전체 대출금의 3분의 1"],ans:"전체 대출금의 3분의 1",exp:"비회원 대출은 전체 대출금의 3분의 1 이내로 제한됩니다."},
    {q:"새마을금고의 신용사업 종류가 아닌 것은?",opts:["예탁금 수납","자금 대출","증권 매매"],ans:"증권 매매",exp:"증권 매매는 새마을금고의 신용사업에 해당하지 않습니다."},
    {q:"새마을금고가 할 수 있는 문화복지사업이 아닌 것은?",opts:["교육·연수사업","의료·복지사업","부동산 투자사업"],ans:"부동산 투자사업",exp:"부동산 투자사업은 새마을금고의 문화복지사업에 해당하지 않습니다."},
    {q:"새마을금고 임원의 자격 제한 사유가 아닌 것은?",opts:["피성년후견인","파산자","외국인"],ans:"외국인",exp:"외국인이라는 이유만으로 임원 자격이 제한되지는 않습니다."},
    {q:"새마을금고 정관 변경 시 인가기관은?",opts:["행정안전부장관","새마을금고중앙회","법원"],ans:"행정안전부장관",exp:"정관 변경은 행정안전부장관의 인가를 받아야 합니다."},
    {q:"새마을금고 회원의 자익권이 아닌 것은?",opts:["이익배당청구권","출자금 환급청구권","임원 해임요구권"],ans:"임원 해임요구권",exp:"임원 해임요구권은 소수회원권(공익권)입니다."},
    {q:"새마을금고 직원을 임면하는 자는?",opts:["이사장","이사회","총회"],ans:"이사장",exp:"새마을금고 직원의 임면권은 이사장에게 있습니다."},
    {q:"새마을금고 예탁금 보호한도는?",opts:["1천만원","3천만원","5천만원"],ans:"5천만원",exp:"새마을금고 예탁금 보호한도는 1인당 5천만원입니다."},
    {q:"새마을금고 합병 후 소멸된 금고의 권리·의무는?",opts:["소멸한다","존속 금고가 승계한다","국가에 귀속된다"],ans:"존속 금고가 승계한다",exp:"합병 시 소멸 금고의 권리·의무는 존속 또는 신설 금고가 포괄 승계합니다."},
    {q:"새마을금고 이사장이 직무를 수행할 수 없을 때 대행하는 자는?",opts:["감사","선임 이사","중앙회장"],ans:"선임 이사",exp:"이사장 직무 대행은 정관이 정하는 바에 따르며, 통상 선임 이사가 대행합니다."},
    {q:"새마을금고법상 벌칙이 가장 무거운 행위는?",opts:["허위 등기","비밀누설","업무상 횡령"],ans:"업무상 횡령",exp:"업무상 횡령 등 금융 관련 중대 범죄가 가장 무거운 벌칙(5년 이하 징역)을 받습니다."},
    {q:"새마을금고 설립 인가를 받기 위해 제출하는 서류가 아닌 것은?",opts:["정관","사업계획서","재무제표"],ans:"재무제표",exp:"설립 신청 시에는 재무제표가 아닌 재산목록을 제출합니다."},
    {q:"새마을금고가 해산하는 경우가 아닌 것은?",opts:["총회의 해산 결의","이사장의 임기 만료","설립인가 취소"],ans:"이사장의 임기 만료",exp:"이사장 임기 만료는 해산 사유가 아닙니다."},
    {q:"새마을금고 잉여금 처리 순서로 옳은 것은?",opts:["결손 보전→법정준비금→배당","배당→결손 보전→법정준비금","법정준비금→배당→결손 보전"],ans:"결손 보전→법정준비금→배당",exp:"잉여금은 결손 보전, 법정준비금 적립, 배당 순으로 처리합니다."},
    {q:"새마을금고 청산인은 누가 선임하는가?",opts:["총회","이사회","행정안전부장관"],ans:"총회",exp:"청산인은 원칙적으로 총회에서 선임합니다."},
    {q:"새마을금고 대의원 선출 방법은?",opts:["이사장이 임명","회원이 직접 선출","이사회가 선임"],ans:"회원이 직접 선출",exp:"대의원은 회원이 직접 선출합니다."},
    {q:"새마을금고 설립인가를 취소할 수 있는 기관은?",opts:["법원","행정안전부장관","새마을금고중앙회"],ans:"행정안전부장관",exp:"설립인가 취소는 행정안전부장관이 할 수 있습니다."},
    {q:"새마을금고에 대한 행정제재 중 가장 가벼운 것은?",opts:["업무정지","과태료","설립인가 취소"],ans:"과태료",exp:"과태료가 가장 가벼운 행정제재입니다."},
    {q:"새마을금고 임원의 결격사유가 아닌 것은?",opts:["피성년후견인","징역형의 집행이 종료된 자","파산선고를 받은 자"],ans:"징역형의 집행이 종료된 자",exp:"징역형 집행이 완전히 종료된 자는 임원 결격사유에 해당하지 않을 수 있습니다."},
    {q:"새마을금고 회원의 탈퇴 방법이 아닌 것은?",opts:["임의탈퇴","당연탈퇴","강제탈퇴"],ans:"강제탈퇴",exp:"강제탈퇴는 없으며, 일정 사유에 의한 제명이 있습니다."},
    {q:"새마을금고 이사회의 주요 심의 사항이 아닌 것은?",opts:["사업계획 및 예산","임원 선출","업무 집행에 관한 사항"],ans:"임원 선출",exp:"임원 선출은 총회의 권한입니다."},
    {q:"새마을금고법에서 정하는 제명 사유가 아닌 것은?",opts:["금고에 손해를 끼친 경우","출자금을 납입하지 않은 경우","사망한 경우"],ans:"사망한 경우",exp:"사망은 제명이 아닌 당연 탈퇴 사유입니다."},
    {q:"새마을금고 이사장 선출 방법은?",opts:["이사회에서 선출","총회에서 선출","행정안전부장관이 임명"],ans:"총회에서 선출",exp:"이사장은 총회에서 회원들이 직접 선출합니다."},
    {q:"새마을금고가 운영하는 사업 중 공제사업의 성격은?",opts:["영리 보험","상호부조적 공제","국가 주도 사회보험"],ans:"상호부조적 공제",exp:"공제사업은 회원 간 상호부조를 목적으로 하는 사업입니다."},
    {q:"새마을금고 감사가 총회를 소집할 수 있는 경우는?",opts:["이사장 요청 시","이사장이 소집하지 않을 경우","중앙회 명령 시"],ans:"이사장이 소집하지 않을 경우",exp:"감사는 이사장이 총회를 소집하지 않을 때 총회를 소집할 수 있습니다."},
    {q:"새마을금고 이사의 선출 방법은?",opts:["이사장이 임명","총회에서 선출","행정안전부장관이 임명"],ans:"총회에서 선출",exp:"이사는 총회에서 선출합니다."},
    {q:"새마을금고 감사의 선출 방법은?",opts:["이사장이 임명","총회에서 선출","이사회에서 선출"],ans:"총회에서 선출",exp:"감사도 총회에서 선출합니다."},
    {q:"새마을금고 회원 자격의 특징이 아닌 것은?",opts:["출자 의무","지역·직장 등 공통 유대","이익 극대화 목적"],ans:"이익 극대화 목적",exp:"새마을금고는 이익 극대화가 아닌 상호부조와 협동을 목적으로 합니다."},
    {q:"새마을금고 회원이 금고에 제기할 수 있는 소송에서 금고를 대표하는 자는?",opts:["이사장","감사","대표이사"],ans:"감사",exp:"회원과 금고 간 소송에서도 감사가 금고를 대표합니다."},
    {q:"새마을금고중앙회의 최고의결기관은?",opts:["이사회","총회","대의원회"],ans:"총회",exp:"중앙회의 최고의결기관도 총회입니다."},
    {q:"새마을금고의 업무구역에 관한 사항은 어디에 정하는가?",opts:["정관","이사회 의결","행정안전부 고시"],ans:"정관",exp:"업무구역은 정관의 기재사항입니다."},
    {q:"새마을금고 설립 발기인의 최소 인원은?",opts:["5인 이상","10인 이상","20인 이상"],ans:"10인 이상",exp:"새마을금고를 설립하려면 10인 이상의 발기인이 필요합니다."},
    {q:"새마을금고 운영의 기본 원칙 중 틀린 것은?",opts:["민주적 운영","상호부조","이윤 극대화"],ans:"이윤 극대화",exp:"새마을금고는 이윤 극대화가 아닌 상호부조와 협동을 기본 원칙으로 합니다."},
    {q:"새마을금고 회원이 탈퇴 후 다시 가입할 수 있는가?",opts:["재가입 불가","재가입 가능","3년 후 재가입 가능"],ans:"재가입 가능",exp:"탈퇴 후에도 자격 요건을 갖추면 재가입이 가능합니다."},
  ],
  3: [ // 4지선다 75문제
    {q:"새마을금고의 지도·감독 주무관청은?",opts:["금융감독원","금융위원회","행정안전부","기획재정부"],ans:"행정안전부",exp:"새마을금고는 행정안전부장관의 지도·감독을 받습니다."},
    {q:"새마을금고법 제정 법률 번호는?",opts:["법률 제2822호","법률 제3622호","법률 제4322호","법률 제5022호"],ans:"법률 제3622호",exp:"새마을금고법은 1983년 법률 제3622호로 제정되었습니다."},
    {q:"새마을금고 회원의 당연 탈퇴 사유가 아닌 것은?",opts:["사망","파산선고","피성년후견 선고","장기 연체"],ans:"장기 연체",exp:"장기 연체는 당연 탈퇴가 아닌 제명 사유입니다."},
    {q:"새마을금고의 최고의결기관은?",opts:["이사회","감사위원회","총회","중앙회"],ans:"총회",exp:"새마을금고의 최고의결기관은 총회입니다."},
    {q:"새마을금고 임원이 아닌 것은?",opts:["이사장","이사","감사","지배인"],ans:"지배인",exp:"지배인은 직원이며 임원이 아닙니다."},
    {q:"새마을금고 설립에 적용되는 입법주의는?",opts:["자유설립주의","준칙주의","인가주의","허가주의"],ans:"인가주의",exp:"새마을금고는 인가주의에 따라 설립됩니다."},
    {q:"새마을금고 소수회원권에 해당하는 것은?",opts:["의결권","선거권","사업이용권","총회소집요구권"],ans:"총회소집요구권",exp:"총회소집요구권은 소수회원권입니다."},
    {q:"새마을금고의 회계연도로 옳은 것은?",opts:["4월 1일~3월 31일","7월 1일~6월 30일","10월 1일~9월 30일","1월 1일~12월 31일"],ans:"1월 1일~12월 31일",exp:"회계연도는 1월 1일부터 12월 31일까지입니다."},
    {q:"새마을금고 회원의 의결권은?",opts:["출자좌수 비례","자산 비례","이용실적 비례","1인 1표"],ans:"1인 1표",exp:"새마을금고는 1인 1표 원칙을 따릅니다."},
    {q:"새마을금고 출자금에 대해 금지되는 것은?",opts:["상속","양도","질권 설정","출자전환"],ans:"질권 설정",exp:"출자금에 대한 질권 설정은 금지됩니다."},
    {q:"총회소집요구권을 행사하려면?",opts:["재적회원 1/10 이상","재적회원 1/5 이상","재적회원 1/4 이상","재적회원 1/3 이상"],ans:"재적회원 1/5 이상",exp:"총회소집요구권은 재적회원 1/5 이상이 연서해야 합니다."},
    {q:"새마을금고 잉여금 배당 방식으로 옳은 것은?",opts:["균등배당과 성과배당","출자배당과 이용고배당","실적배당과 균등배당","출자배당과 균등배당"],ans:"출자배당과 이용고배당",exp:"잉여금 배당은 출자배당과 이용고배당으로 이루어집니다."},
    {q:"새마을금고 해산 사유가 아닌 것은?",opts:["정관에 정한 해산 사유 발생","총회의 해산의결","이사장의 해산 선언","설립인가 취소"],ans:"이사장의 해산 선언",exp:"이사장 단독으로 해산을 결정할 수 없습니다."},
    {q:"새마을금고 대의원의 임기는?",opts:["1년","2년","3년","4년"],ans:"2년",exp:"대의원의 임기는 2년입니다."},
    {q:"새마을금고 법인의 성격으로 모두 옳은 것은?",opts:["사단법인·비영리법인·특수법인","재단법인·비영리법인·특수법인","사단법인·영리법인·특수법인","재단법인·영리법인·일반법인"],ans:"사단법인·비영리법인·특수법인",exp:"새마을금고는 사단법인, 비영리법인, 특수법인의 성격을 가집니다."},
    {q:"새마을금고법의 최고 벌칙은?",opts:["2년 이하 징역 또는 2천만원 이하 벌금","3년 이하 징역 또는 3천만원 이하 벌금","5년 이하 징역 또는 5천만원 이하 벌금","7년 이하 징역 또는 7천만원 이하 벌금"],ans:"5년 이하 징역 또는 5천만원 이하 벌금",exp:"새마을금고법의 최고 형벌은 5년 이하 징역 또는 5천만원 이하 벌금입니다."},
    {q:"새마을금고 총회 소집권자가 아닌 것은?",opts:["이사장","감사","지배인","청산인"],ans:"지배인",exp:"지배인은 총회 소집권자가 아닙니다."},
    {q:"새마을금고 정관의 절대적 기재사항이 아닌 것은?",opts:["목적","명칭","임원의 보수","업무구역"],ans:"임원의 보수",exp:"임원의 보수는 절대적 기재사항이 아닙니다."},
    {q:"새마을금고 회원의 제명 절차에 관한 설명 중 틀린 것은?",opts:["이사장 단독으로 제명할 수 있다","제명은 총회 의결을 거쳐야 한다","제명된 회원은 출자금 환급을 청구할 수 있다","제명 사유가 있어야 한다"],ans:"이사장 단독으로 제명할 수 있다",exp:"제명은 총회 의결을 거쳐야 하며, 이사장 단독으로 결정할 수 없습니다."},
    {q:"새마을금고가 할 수 있는 신용사업이 아닌 것은?",opts:["예탁금·적금 수납","자금 대출","어음할인","주식 인수"],ans:"주식 인수",exp:"주식 인수는 새마을금고의 신용사업이 아닙니다."},
    {q:"새마을금고 감사의 특별한 권한이 아닌 것은?",opts:["금고 대표권(소송 시)","총회 소집권","이사회 소집권","임원 임명권"],ans:"임원 임명권",exp:"감사는 임원 임명권을 가지지 않습니다."},
    {q:"새마을금고 청산 시 청산인의 직무가 아닌 것은?",opts:["현존 사무 종결","채권 추심","채무 변제","새로운 사업 개시"],ans:"새로운 사업 개시",exp:"청산 중에는 새로운 사업을 개시할 수 없습니다."},
    {q:"새마을금고 이사회 결의 성립 요건은?",opts:["이사 과반수 출석·과반수 찬성","이사 전원 출석·전원 찬성","이사 1/3 출석·과반수 찬성","이사 2/3 출석·2/3 찬성"],ans:"이사 과반수 출석·과반수 찬성",exp:"이사회는 이사 과반수의 출석과 출석이사 과반수의 찬성으로 의결합니다."},
    {q:"새마을금고 예금자보호준비금에 관한 설명 중 틀린 것은?",opts:["금고 회원의 예탁금을 보호한다","예금보험공사가 관리한다","중앙회에 설치된다","일정 비율로 조성된다"],ans:"예금보험공사가 관리한다",exp:"새마을금고 예금자보호준비금은 예금보험공사가 아닌 새마을금고중앙회에 설치됩니다."},
    {q:"새마을금고의 주소는 어디에 두는가?",opts:["이사장의 주소지","주된 사무소 소재지","중앙회 소재지","행정안전부 소재지"],ans:"주된 사무소 소재지",exp:"새마을금고의 주소는 주된 사무소 소재지에 둡니다."},
    // ── 추가 50문제 ──
    {q:"새마을금고 이사장의 임기로 옳은 것은?",opts:["1년","2년","3년","4년"],ans:"2년",exp:"새마을금고 이사장의 임기는 2년입니다."},
    {q:"새마을금고 법정준비금 적립 비율은?",opts:["잉여금의 5분의 1 이상","잉여금의 10분의 1 이상","잉여금의 20분의 1 이상","잉여금의 3분의 1 이상"],ans:"잉여금의 10분의 1 이상",exp:"법정준비금은 매 회계연도 잉여금의 10분의 1 이상을 적립합니다."},
    {q:"새마을금고 총회 특별결의 요건으로 옳은 것은?",opts:["재적 1/3 출석·출석 과반수","재적 과반수 출석·출석 과반수","재적 과반수 출석·출석 2/3 이상","재적 2/3 출석·출석 2/3 이상"],ans:"재적 과반수 출석·출석 2/3 이상",exp:"특별결의는 재적 과반수 출석, 출석회원 3분의 2 이상 찬성입니다."},
    {q:"새마을금고 예탁금 보호한도로 옳은 것은?",opts:["1천만원","3천만원","5천만원","1억원"],ans:"5천만원",exp:"새마을금고 예탁금은 1인당 5천만원까지 보호됩니다."},
    {q:"새마을금고 창립총회 소집권자는?",opts:["이사장 예정자","발기인","행정안전부장관","중앙회장"],ans:"발기인",exp:"창립총회는 발기인이 소집합니다."},
    {q:"새마을금고 설립 발기인 최소 인원은?",opts:["5인 이상","10인 이상","15인 이상","20인 이상"],ans:"10인 이상",exp:"새마을금고 설립을 위해서는 10인 이상의 발기인이 필요합니다."},
    {q:"이사장과 금고 간 소송에서 금고를 대표하는 사람은?",opts:["부이사장","선임 이사","감사","중앙회장"],ans:"감사",exp:"이사장과 금고 간 소송에서는 감사가 금고를 대표합니다."},
    {q:"새마을금고 회원의 소수회원권 행사 요건은?",opts:["재적 1/10 이상","재적 1/5 이상","재적 1/4 이상","재적 1/3 이상"],ans:"재적 1/5 이상",exp:"소수회원권은 재적회원 1/5 이상의 연서로 행사할 수 있습니다."},
    {q:"새마을금고 비회원 대출 한도는?",opts:["전체 대출금의 1/10","전체 대출금의 1/5","전체 대출금의 1/3","전체 대출금의 1/2"],ans:"전체 대출금의 1/3",exp:"비회원 대출은 전체 대출금의 3분의 1 이내로 제한됩니다."},
    {q:"새마을금고 잉여금 처리 순서로 옳은 것은?",opts:["배당→결손 보전→준비금","결손 보전→준비금→배당","준비금→배당→결손 보전","결손 보전→배당→준비금"],ans:"결손 보전→준비금→배당",exp:"잉여금은 결손 보전, 법정준비금 적립, 배당 순으로 처리합니다."},
    {q:"새마을금고 임원 결격사유가 아닌 것은?",opts:["피성년후견인","미성년자","파산자로 복권되지 않은 자","징역형 집행이 완전히 종료된 자"],ans:"징역형 집행이 완전히 종료된 자",exp:"형의 집행이 완전히 종료된 자는 결격사유에서 제외될 수 있습니다."},
    {q:"새마을금고 출자금 탈퇴 시 환급 시기는?",opts:["탈퇴 즉시","탈퇴한 회계연도 결산 후","다음 회계연도 중","3년 후"],ans:"탈퇴한 회계연도 결산 후",exp:"출자금은 탈퇴한 회계연도 결산 후 환급합니다."},
    {q:"새마을금고 동일인 대출 한도는?",opts:["자기자본의 10%","자기자본의 20%","자기자본의 30%","자기자본의 50%"],ans:"자기자본의 20%",exp:"동일인 대출 한도는 자기자본의 100분의 20입니다."},
    {q:"새마을금고 감사가 이사회를 소집할 수 있는 경우는?",opts:["항상 가능","이사장 부재 시","이사장이 소집하지 않을 때","중앙회 요청 시"],ans:"이사장이 소집하지 않을 때",exp:"감사는 이사장이 이사회를 소집하지 않을 때 소집할 수 있습니다."},
    {q:"새마을금고 정관 변경 인가 기관은?",opts:["법원","새마을금고중앙회","행정안전부장관","기획재정부장관"],ans:"행정안전부장관",exp:"정관 변경은 행정안전부장관의 인가를 받아야 합니다."},
    {q:"새마을금고 임원 선출 기관은?",opts:["이사회","총회","행정안전부","새마을금고중앙회"],ans:"총회",exp:"임원(이사장·이사·감사)은 총회에서 선출합니다."},
    {q:"새마을금고 직원 임면권자는?",opts:["이사회","총회","이사장","감사"],ans:"이사장",exp:"직원의 임면권은 이사장에게 있습니다."},
    {q:"새마을금고 해산 후 잔여재산 귀속처(정관에 규정이 없는 경우)는?",opts:["국가","행정안전부","새마을금고중앙회","지방자치단체"],ans:"새마을금고중앙회",exp:"정관에 규정이 없으면 잔여재산은 새마을금고중앙회에 귀속됩니다."},
    {q:"새마을금고 설립인가 취소 권한을 가진 자는?",opts:["법원","검찰","행정안전부장관","새마을금고중앙회"],ans:"행정안전부장관",exp:"설립인가 취소는 행정안전부장관이 할 수 있습니다."},
    {q:"새마을금고 대의원 임기는?",opts:["1년","2년","3년","4년"],ans:"2년",exp:"대의원의 임기는 2년입니다."},
    {q:"새마을금고 회원의 자익권이 아닌 것은?",opts:["이익배당청구권","출자금 환급청구권","사업이용권","임원 해임요구권"],ans:"임원 해임요구권",exp:"임원 해임요구권은 소수회원권(공익권)에 해당합니다."},
    {q:"새마을금고 정기총회 개최 빈도는?",opts:["매월 1회","매 분기 1회","매년 2회","매년 1회"],ans:"매년 1회",exp:"정기총회는 매년 1회 개최합니다."},
    {q:"새마을금고 총회에서 보통결의가 아닌 특별결의 사항은?",opts:["예산 승인","결산 보고","임원 선출","정관 변경"],ans:"정관 변경",exp:"정관 변경은 총회 특별결의 사항입니다."},
    {q:"새마을금고중앙회의 회원은?",opts:["개인 회원","각 새마을금고","금융기관","행정안전부"],ans:"각 새마을금고",exp:"중앙회의 회원은 각 새마을금고입니다."},
    {q:"새마을금고가 수행할 수 없는 사업은?",opts:["신용사업","공제사업","문화복지사업","증권 인수업"],ans:"증권 인수업",exp:"증권 인수업은 새마을금고의 사업 범위에 포함되지 않습니다."},
    {q:"새마을금고의 공제사업에서 지급하는 공제금은 어느 기관이 보호하는가?",opts:["예금보험공사","새마을금고중앙회","금융감독원","행정안전부"],ans:"새마을금고중앙회",exp:"공제금 보호는 새마을금고중앙회가 담당합니다."},
    {q:"새마을금고 임원이 법령 위반 시 해임을 요구할 수 있는 자는?",opts:["회원 과반수","새마을금고중앙회","행정안전부장관","법원"],ans:"행정안전부장관",exp:"행정안전부장관이 법령 위반 임원에 대한 해임 요구권을 가집니다."},
    {q:"새마을금고 합병 시 소멸 금고의 권리·의무 처리 방법은?",opts:["소멸","존속·신설 금고가 승계","국가에 귀속","채무만 승계"],ans:"존속·신설 금고가 승계",exp:"합병 시 소멸 금고의 권리·의무는 존속 또는 신설 금고가 포괄 승계합니다."},
    {q:"새마을금고 청산인의 주요 직무가 아닌 것은?",opts:["현존 사무 종결","채권 추심 및 채무 변제","잔여재산 처분","신규 대출 실행"],ans:"신규 대출 실행",exp:"청산 중에는 신규 대출 등 새로운 영업행위를 할 수 없습니다."},
    {q:"새마을금고 이사회 구성원이 아닌 것은?",opts:["이사장","이사","감사","청산인"],ans:"감사",exp:"이사회는 이사장과 이사로 구성되며, 감사는 이사회 구성원이 아닙니다."},
    {q:"새마을금고법상 과태료 부과 대상이 아닌 것은?",opts:["등기 해태","보고 거부","총회 소집 방해","정관 미비치"],ans:"총회 소집 방해",exp:"총회 소집 방해는 과태료가 아닌 형사처벌 대상입니다."},
    {q:"새마을금고 이사장의 직무 대행자는?",opts:["감사","정관이 정하는 이사","선임 이사","중앙회가 지정하는 자"],ans:"정관이 정하는 이사",exp:"이사장 직무 대행은 정관이 정하는 이사가 수행합니다."},
    {q:"새마을금고 감사가 총회를 소집할 수 있는 경우는?",opts:["언제든지 가능","이사장 요청 시에만","이사장이 소집하지 않는 경우","중앙회 지시 시"],ans:"이사장이 소집하지 않는 경우",exp:"감사는 이사장이 총회를 소집하지 않는 경우 총회를 소집할 수 있습니다."},
    {q:"새마을금고가 해산하는 경우가 아닌 것은?",opts:["총회의 해산 결의","설립인가 취소","이사장의 단독 결정","정관에 정한 해산 사유 발생"],ans:"이사장의 단독 결정",exp:"이사장 단독으로 금고를 해산할 수 없습니다."},
    {q:"새마을금고 출자금의 성격이 아닌 것은?",opts:["질권 설정 가능","양도 가능","상속 가능","상계 금지"],ans:"질권 설정 가능",exp:"출자금에 대한 질권 설정은 새마을금고법에서 금지합니다."},
    {q:"새마을금고 회원의 권리 중 공익권이 아닌 것은?",opts:["의결권","선거권","총회소집요구권","사업이용권"],ans:"사업이용권",exp:"사업이용권은 자익권이며 공익권이 아닙니다."},
    {q:"새마을금고가 설립되기 위해 필요한 최소 회원 수는?",opts:["5인 이상","10인 이상","20인 이상","30인 이상"],ans:"10인 이상",exp:"새마을금고 설립을 위해서는 10인 이상의 발기인(회원)이 필요합니다."},
    {q:"새마을금고 행정제재 수단 중 가장 중한 것은?",opts:["경고","과태료","업무정지","설립인가 취소"],ans:"설립인가 취소",exp:"설립인가 취소가 가장 중한 행정제재입니다."},
    {q:"새마을금고 임원 중 법인 대표권을 가진 자는?",opts:["이사장","이사","감사","지배인"],ans:"이사장",exp:"이사장이 새마을금고를 대표하는 법인 대표자입니다."},
    {q:"새마을금고 지배인의 임면권자는?",opts:["총회","이사회","이사장","감사"],ans:"이사장",exp:"지배인은 이사장이 임면합니다."},
    {q:"새마을금고 정관의 기재사항 중 절대적 기재사항이 아닌 것은?",opts:["목적","명칭","업무구역","임원 보수"],ans:"임원 보수",exp:"임원 보수는 정관의 절대적 기재사항이 아닙니다."},
    {q:"새마을금고 대의원회가 총회에 갈음하는 경우 대의원의 임기는?",opts:["1년","2년","3년","4년"],ans:"2년",exp:"대의원의 임기는 2년입니다."},
    {q:"새마을금고 회원이 탈퇴할 경우 출자금 환급 청구 방법은?",opts:["탈퇴 즉시 청구 가능","해당 연도 결산 후 청구 가능","3년 후 청구 가능","청구 불가"],ans:"해당 연도 결산 후 청구 가능",exp:"탈퇴 회원은 해당 회계연도 결산 후 출자금 환급을 청구할 수 있습니다."},
    {q:"새마을금고법상 임원의 겸직 금지 대상이 아닌 것은?",opts:["타 금고 임원","타 금고 직원","다른 사업체 대표","지방의회 의원"],ans:"지방의회 의원",exp:"지방의회 의원은 새마을금고법상 임원 겸직 금지 대상이 아닙니다."},
    {q:"새마을금고 설립인가 신청 시 제출하지 않아도 되는 서류는?",opts:["정관","사업계획서","재산목록","재무제표"],ans:"재무제표",exp:"설립 신청 시 재무제표가 아닌 재산목록을 제출합니다."},
    {q:"새마을금고법에서 이사장과 회원 간 이해충돌 시 처리 방법은?",opts:["이사장이 결정","이사회가 결정","감사가 금고 대표","총회가 결정"],ans:"감사가 금고 대표",exp:"이사장과 금고(회원 포함) 간 이해충돌 시 감사가 금고를 대표합니다."},
    {q:"새마을금고 공제사업의 성격으로 옳은 것은?",opts:["영리 목적 보험","상호부조적 공제","국가 사회보험","투자형 상품"],ans:"상호부조적 공제",exp:"공제사업은 회원 상호간 부조를 목적으로 합니다."},
    {q:"새마을금고 회원 가입 요건이 아닌 것은?",opts:["해당 구역 내 거주","출자 이행","가입 신청","피성년후견인이 아닐 것"],ans:"해당 구역 내 거주",exp:"거주는 지역금고의 일반 요건이지만, 직장금고 등 다른 유형은 요건이 다를 수 있습니다."},
    {q:"새마을금고 설립을 위한 최소 출자 요건은?",opts:["정관에서 정함","법에서 일률적으로 정함","중앙회가 정함","행정안전부가 정함"],ans:"정관에서 정함",exp:"최소 출자 요건은 각 금고의 정관에서 정합니다."},
    {q:"새마을금고 이사회 소집 방법으로 옳은 것은?",opts:["이사장이 소집","감사가 소집","이사 과반수가 요구","중앙회가 소집"],ans:"이사장이 소집",exp:"이사회는 이사장이 소집하는 것이 원칙입니다."},
    {q:"새마을금고 신용사업 범위에 포함되는 것은?",opts:["주식 발행","어음할인","부동산 임대","증권 인수"],ans:"어음할인",exp:"어음할인은 새마을금고의 신용사업에 포함됩니다."},
    {q:"새마을금고 임원의 임기가 만료된 경우 처리는?",opts:["즉시 권한 소멸","후임 선출 전까지 직무 수행","중앙회가 지정한 자가 대행","이사회가 선임"],ans:"후임 선출 전까지 직무 수행",exp:"임원은 임기 만료 후에도 후임 선출 전까지 직무를 수행합니다."},
    {q:"새마을금고의 명칭에 반드시 포함되어야 하는 단어는?",opts:["금융","협동","새마을금고","지역"],ans:"새마을금고",exp:"새마을금고의 명칭에는 반드시 '새마을금고'라는 단어가 포함되어야 합니다."},
  ]
};

const SECTOR_NAMES = {1:'섹터1 OX퀴즈',2:'섹터2 3지선다',3:'섹터3 4지선다'};
let state = {
  players:{}, battles:{}, nextPlayerId:1, pendingChallenges:{},
  finalStage: false,
  // 스테이지 타이머
  stageTimer: null,       // setInterval 핸들
  stageRemaining: 0,      // 남은 초
  stageDuration: 600,     // 기본 10분(초)
  stageActive: false,     // 타이머 진행 중?
  lockNew: false          // 20초 이내 → 신규 대결 잠금
};

function getSocket(sid){return io.sockets.sockets.get(sid);}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function randomSector(){return Math.floor(Math.random()*3)+1;}
function selectQuestions(sector,count){return shuffle(QUIZ_DB[sector]).slice(0,Math.min(count,QUIZ_DB[sector].length));}
function publicPlayers(){return Object.values(state.players).map(p=>({id:p.id,name:p.name,team:p.team,wins:p.wins,losses:p.losses,correct:p.correct,total:p.total,online:p.online,battleCount:p.battled.length,inBattle:p.inBattle}));}
function emitRankings(){io.emit('playersUpdate',publicPlayers());}
function emitFinalStage(){io.emit('finalStageChanged',{active:state.finalStage});}
function emitSystemState(socket){
  (socket||io).emit('systemState',{
    finalStage:state.finalStage,
    stageActive:state.stageActive,
    stageRemaining:state.stageRemaining,
    stageDuration:state.stageDuration,
    lockNew:state.lockNew
  });
}

// ── 스테이지 타이머 ──
function startStageTimer(minutes){
  if(state.stageTimer) clearInterval(state.stageTimer);
  state.stageDuration = (minutes||10)*60;
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
  const sector=randomSector();
  const qs=selectQuestions(sector,5);
  const battleId=`${p1Id}_${p2Id}_${Date.now()}`;
  state.battles[battleId]={id:battleId,players:[p1Id,p2Id],questions:qs,currentQ:0,scores:{[p1Id]:0,[p2Id]:0},qAnswers:{},qResolved:{},timer:null,status:'active',sector};
  state.players[p1Id].inBattle=true;
  state.players[p2Id].inBattle=true;
  sendQuestion(battleId,0);
  emitRankings();
}

function sendQuestion(battleId,qIdx){
  const battle=state.battles[battleId];
  if(!battle||battle.status!=='active')return;
  const q=battle.questions[qIdx];
  const payload={battleId,qIdx,question:q.q,options:q.opts,sector:battle.sector,sectorName:SECTOR_NAMES[battle.sector],scores:battle.scores,totalQ:battle.questions.length};
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
  const result={qIdx,winnerId,correctAnswer:q.ans,explanation:q.exp,scores:battle.scores,p1Id:p1,p2Id:p2,sector:battle.sector,sectorName:SECTOR_NAMES[battle.sector]};
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
    yourId:pid,sector:battle.sector,sectorName:SECTOR_NAMES[battle.sector],
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
  socket.on('challenge',(oppId)=>{
    const me=state.players[socket.playerId],opp=state.players[oppId];
    if(!me||!opp)return socket.emit('challengeError','존재하지 않는 번호입니다.');
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
    socket.emit('adminQuestions',QUIZ_DB);
  });
  // 문제 추가
  socket.on('adminAddQuestion',({sector,q})=>{
    if(!socket.isAdmin)return;
    if(!QUIZ_DB[sector])QUIZ_DB[sector]=[];
    QUIZ_DB[sector].push(q);
    socket.emit('adminQuestions',QUIZ_DB);
    socket.emit('adminMsg',`✅ ${SECTOR_NAMES[sector]}에 문제 추가 완료 (총 ${QUIZ_DB[sector].length}문제)`);
  });
  // 문제 수정
  socket.on('adminEditQuestion',({sector,index,q})=>{
    if(!socket.isAdmin)return;
    if(QUIZ_DB[sector]&&QUIZ_DB[sector][index]){
      QUIZ_DB[sector][index]=q;
      socket.emit('adminQuestions',QUIZ_DB);
      socket.emit('adminMsg',`✅ ${SECTOR_NAMES[sector]} ${index+1}번 문제 수정 완료`);
    }
  });
  // 문제 삭제
  socket.on('adminDeleteQuestion',({sector,index})=>{
    if(!socket.isAdmin)return;
    if(QUIZ_DB[sector]){
      QUIZ_DB[sector].splice(index,1);
      socket.emit('adminQuestions',QUIZ_DB);
      socket.emit('adminMsg',`🗑 ${SECTOR_NAMES[sector]} ${index+1}번 문제 삭제 완료`);
    }
  });
  // 엑셀 업로드로 전체 교체
  socket.on('adminImportQuestions',(newDB)=>{
    if(!socket.isAdmin)return;
    QUIZ_DB=newDB;
    socket.emit('adminQuestions',QUIZ_DB);
    const total=Object.values(newDB).reduce((s,a)=>s+a.length,0);
    socket.emit('adminMsg',`✅ 문제 업로드 완료! 총 ${total}문제가 적용되었습니다.`);
  });

  socket.on('getRankings',()=>socket.emit('playersUpdate',publicPlayers()));
  socket.on('getSystemState',()=>emitSystemState(socket));

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
    startStageTimer(minutes||10);
    socket.emit('adminMsg',`✅ 스테이지 타이머 시작! ${minutes||10}분`);
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
    state.stageDuration=(minutes||10)*60;
    socket.emit('adminMsg',`⏱ 스테이지 기본 시간: ${minutes||10}분`);
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
    if(socket.playerId&&state.players[socket.playerId])state.players[socket.playerId].online=false;
    const oId=state.pendingChallenges[socket.playerId];
    if(oId){getSocket(state.players[oId]?.socketId)?.emit('challengeCancelled');delete state.pendingChallenges[socket.playerId];}
    emitRankings();
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
