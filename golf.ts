// golf.ts

const Clubs = new Map();

Clubs.set('D', ["Driver", 220]);
Clubs.set('W3', ["Wood3", 200]);
Clubs.set('UW', ["UtilityWood", 190]);
Clubs.set('U3', ["Hybrid3", 180]);
Clubs.set('U4', ["Hybrid4", 170]);
Clubs.set('I3', ["Iron3", 170]);
Clubs.set('I4', ["Iron4", 160]);
Clubs.set('I5', ["Iron5", 150]);
Clubs.set('I6', ["Iron6", 140]);
Clubs.set('I7', ["Iron7", 130]);
Clubs.set('I8', ["Iron8", 120]);
Clubs.set('I9', ["Iron9", 110]);
Clubs.set('IP', ["IronP", 100]);
Clubs.set('W48', ["Wedge48", 95]);
Clubs.set('W52', ["Wedge52", 85]);
Clubs.set('W56', ["Wedge56", 75]);
Clubs.set('P', ["Putter", 7]);

class Shot {
  club: string;
  dist: number;
  feel: string;
  quality: string;
  penalty: number;
  ok: boolean;
  bunker: boolean;
  pos: string;

  constructor(line: string) {
    let tmp:string[] = line.split(" ");

    if (isNaN(Number(tmp[0])) == false)
      tmp[0] = "W" + tmp[0];

    let club = Clubs.get(tmp[0]);
    this.club = club[0];
    this.feel = tmp[1];
    this.quality = tmp[2];
    this.ok = false;
    this.penalty = 0;
    this.dist = 0;

    if (!(tmp[2] === "C" && tmp[3] === "B")) {
      if (tmp[2] === "C")
        tmp.splice(3, 0, "R");
      else
        tmp.splice(3, 0, "F");
      this.bunker = false;
    } else {
      this.bunker = true;
    }

    this.pos = tmp[3];

    if (tmp.length > 4) {
      if (isNaN(Number(tmp[4]))) {
        this._setPnO(tmp[4]);

      } else {
        this.dist = Number(tmp[4]);
        if (tmp.length == 6) {
          this._setPnO(tmp[5]);
        }
      }
    } else {
      this.dist = club[1];
    }
  }

  resetPos(pos: string) {
    this.pos = pos;
  }

  getPos() {
    return this.pos;
  }

  _setPnO (term: string) {
    if (term === "H") {
      this.penalty = 1;
    } else if (term === "OB") {
      this.penalty = 2;
    } else if (term === "OK") {
      this.ok = true;
    }
  }

  getJSON() {
    return JSON.stringify({
      "club": this.club,
      "distance": this.dist,
      "feel": this.feel,
      "quality": this.quality,
      "penalty": this.penalty,
      "ok": this.ok
    });
  }

  isOK() {
    return this.ok;
  }

  isPutt() {
    if (this.club == "Putter")
      return true;
    return false;
  }

  getPenalty() {
    return this.penalty;
  }

  getFeel() {
    return this.feel;
  }

  getQuality() {
    return this.quality;
  }

  getResult() {
    return this.feel + this.quality;
  }

  getClub() {
    return this.club;
  }
}

class Hole {
  index: number;
  par: number;

  score: number = 0;
  putt: number = 0;
  penalty: number = 0;

  shots: Shot[] = [];

  constructor(line: string) {
    let tmp = line.split(" ");
    if (tmp.length == 1)
      tmp = line.split("P");
    else
      tmp[1] = tmp[1].substring(1);
    this.index = Number(tmp[0]);
    this.par = Number(tmp[1]);
  }

  getJSON() {
    let obj = {
      "hole": this.index,
      "par": this.par,
      "score": this.score,
      "putt": this.putt,
      "penalty": this.penalty,
      "GIR": this.isGIR(),
      "GIR1": this.isGIR1(),
      "shots": null
    }

    let s = "[";
    for (let i = 0; i < this.shots.length; i++) {
      s = s + this.shots[i].getJSON()
      if (i == this.shots.length - 1)
        s = s + "]";
      else
        s = s + ",";
    }

    obj["shots"] = JSON.parse(s);
    return JSON.stringify(obj);
  }

  getPar() {
    return this.par;
  }

  isGIR() {
    if (this.par - 2 >= this.score - this.putt) 
      return true;
    else
      return false;
  }
  
  isGIR1() {
    if (this.par - 1 >= this.score - this.putt) 
      return true;
    else
      return false;
  }

  getHoleName():string {
    return this.index + " P" + this.par;
  }

  getScore():number {
    return this.score;
  }

  getPutt():number {
    return this.putt;
  }

  getPenalty():number {
    return this.penalty;
  }

  getShots():Shot[] {
    return this.shots;
  }

  addShot(shot: Shot) {
    this.shots.push(shot);
  }

  update() {
    this.score = 0;
    this.putt = 0;
    this.penalty = 0;

    for (let i = 0; i < this.shots.length; i++) {
      this.score += 1 + this.shots[i].getPenalty();
      this.penalty += this.shots[i].getPenalty();

      if (this.shots[i].isPutt())
        this.putt ++;

      if (this.shots[i].isOK()) {
        this.putt ++;
        this.score ++;
      }

      if (i != 0) {
        this.shots[i].resetPos(this.shots[i-1].getPos());
      }
    }

    return this.score + this.penalty;
  }
}

class Round {
  score: number = 0;
  holes: Hole[] = [];

  constructor (lines: string[]) {
    this.score = 0;
    let hole = null;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] && lines[i].trim()) {   // empty line skip
        let tline = lines[i].toUpperCase();
        if (this._isHoleLine(tline)) {
          if (hole != null) {
            hole.update();
            this.holes.push(hole);
          }
          hole = new Hole(tline);
        } else if (this._isShotLine(tline)) {
          let shot = new Shot(tline);
          if (hole != null)
            hole.addShot(shot);
        } else {
          console.log("Fail to parse line : ", lines[i]);
        }
      }
    }

    if (hole != null) {
      hole.update();
      this.holes.push(hole);
    }
    this.score = this.holes.reduce((sum, hole) => sum + hole.getScore(), 0);
  }

  /**
   * 입력된 문자열이 유효한 골프 홀 라인인지 검증합니다.
   * @param {string} line - 검증할 홀 라인 문자열
   * @returns {boolean} 유효한 홀 라인 여부
   */
  _isHoleLine(line: string) {
    // 빈 문자열이나 null 체크
    if (!line || line.trim() === '') return false;

    // 공백으로 분리하거나 'P'로 분리
    const parts = line.replace(/\s/g, "").split('P');

    // 홀 번호 부분 추출 및 검증
    const holeNumberStr = parts[0].trim();

    // 숫자 변환 시도
    const holeNumber = Number(holeNumberStr);

    // 유효성 검사 강화
    if ( isNaN(holeNumber) || holeNumber < 1 || holeNumber > 36) {
      return false;
    }

    // 파 정보 검증 (선택적)
    if (parts.length > 1) {
      const parStr = parts[1].trim();
      const parNumber = Number(parStr);

      // 파 정보가 있다면 유효한 골프 파 범위(3-5) 검증
      if ( isNaN(parNumber) || parNumber < 3 || parNumber > 5) {
        return false;
      }
    }

    return true;
  }

  /**
   * 입력된 문자열이 유효한 골프 샷 라인인지 검증합니다.
   * @param {string} line - 검증할 샷 라인 문자열
   * @returns {boolean} 유효한 샷 라인 여부
   */
  _isShotLine(line: string): boolean {
    // 빈 문자열이나 null 체크
    if (!line || line.trim() === '') return false;

    // 공백으로 분리
    const parts = line.trim().split(/\s+/);

    // 최소 3개 부분(클럽, 샷감, 샷결과) 필요
    if (parts.length < 3) return false;

    // 클럽 코드 검증 (Clubs Map 활용)
    const clubCode = parts[0];
    const validClubCodes = Array.from(Clubs.keys());

    // 클럽 코드가 유효한지 확인
    if (!validClubCodes.includes(clubCode)) {
      // 숫자로 시작하는 클럽 코드 추가 검증 (예: W48, W52)
      const numberClubRegex = /^W?\d+$/;
      if (!numberClubRegex.test(clubCode)) return false;
    }

    // 샷감 검증 (A, B, C만 허용)
    const feel = parts[1];
    if (!['A', 'B', 'C'].includes(feel)) return false;

    // 샷결과 검증 (예: A, B, C 등 문자열)
    const quality = parts[2];
    if (!['A', 'B', 'C'].includes(quality)) return false;

    // 선택적 부분 (거리, 페널티 등) 검증
    for (let i = 3; i < parts.length; i++) {
      const part = parts[i];

      // 거리 검증 (숫자인지)
      if (!isNaN(Number(part))) 
        continue;

      // 페널티/컨시드 검증
      const validExtras = ['B', 'H', 'OB', 'OK'];
      if (!validExtras.includes(part)) 
        return false;
    }

    return true;
  }

  getScore() {
    return this.score;
  }

  getHoleScores() {
    let scores = []
    for (let i = 0; i < this.holes.length; i++) {
      scores.push(this.holes[i].getScore());
    }
    return scores;
  }
  
  getHole(num: number) {
    return this.holes[num-1];
  }

  getNumberofHoles() {
    return this.holes.length;
  }

  getShotFeel() {
    let A = 0, B = 0, C = 0;

    for (let i = 0; i < this.holes.length; i++) {
      let shots = this.holes[i].getShots();
      for (let j = 0; j < shots.length; j++) {
        let feel = shots[j].getFeel();
        if (feel === "A")
          A++;
        else if (feel === "B")
          B++;
        else
          C++;
      }
    }

    return [A, B, C];
  }

  getExpected() {
    let A = 0, C = 0, par = 0;

    for (let i = 0; i < this.holes.length; i++) {
      par += this.holes[i].getPar();
      let shots = this.holes[i].getShots();
      for (let j = 0; j < shots.length; j++) {
        let feel = shots[j].getQuality();
        if (feel === "A")
          A++;
        else if (feel === "C")
          C++;
      }
    }

    return par - A + C + this.getTotalPenalty();
  }

  getAveragePutt() {
    let np = 0;

    for (let i = 0; i < this.holes.length; i++) {
      np += this.holes[i].getPutt();
    }

    return np / this.holes.length;
  }

  getGIRRate() {
    return [
      (this.holes.filter(hole => hole.isGIR()).length / this.getNumberofHoles()) * 100,
      (this.holes.filter(hole => hole.isGIR1()).length / this.getNumberofHoles()) * 100
    ];
  }

  getTotalPenalty() {
    return this.holes.reduce((sum, hole) => sum + hole.getPenalty(), 0);
  }
}

class RoundStatistics {
  private rounds: Round[];

  constructor(rounds: Round[]) {
    this.rounds = rounds;
  }

  // 전체 라운드 평균 스코어 계산
  calculateAverageScore(): number {
    const totalScore = this.rounds.reduce((sum, round) => sum + round.getScore(), 0);
    return totalScore / this.rounds.length;
  }

  // 라운드별 스코어 분포 분석
  getScoreDistribution(): {
    min: number,
    max: number,
    median: number,
    standardDeviation: number
  } {
    const scores = this.rounds.map(round => round.getScore());
    scores.sort((a, b) => a - b);

    const min = Math.min(...scores);
    const max = Math.max(...scores);

    // 중앙값 계산
    const median = scores.length % 2 === 0
      ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
      : scores[Math.floor(scores.length / 2)];

    // 표준편차 계산
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    return { min, max, median, standardDeviation };
  }

  // GIR(그린 인 레귤레이션) 통계
  calculateGIRStatistics(): {
    averageGIRPercentage: number,
    bestGIRRound: { roundIndex: number, percentage: number },
    worstGIRRound: { roundIndex: number, percentage: number }
  } {
    const girPercentages = this.rounds.map((round, index) => ({
      roundIndex: index,
      percentage: (round.holes.filter(hole => hole.isGIR()).length / round.getNumberofHoles()) * 100
    }));

    const averageGIRPercentage = girPercentages.reduce((sum, gir) => sum + gir.percentage, 0) / girPercentages.length;

    const bestGIRRound = girPercentages.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );

    const worstGIRRound = girPercentages.reduce((worst, current) =>
      current.percentage < worst.percentage ? current : worst
    );

    return {
      averageGIRPercentage,
      bestGIRRound,
      worstGIRRound
    };
  }

  // 벌타 통계
  calculatePenaltyStatistics(): {
    averagePenaltiesPerRound: number,
    averagePenaltiesPerHole: number,
    totalPenalties: number
  } {
    const penaltyStats = this.rounds.map(round =>
      round.holes.reduce((sum, hole) => sum + hole.getPenalty(), 0)
    );

    const totalPenalties = penaltyStats.reduce((sum, penalties) => sum + penalties, 0);
    const averagePenaltiesPerRound = totalPenalties / this.rounds.length;
    const averagePenaltiesPerHole = totalPenalties / (this.rounds.length * this.rounds[0].getNumberofHoles());

    return {
      averagePenaltiesPerRound,
      averagePenaltiesPerHole,
      totalPenalties
    };
  }

  // 샷 느낌(Feel) 종합 분석
  analyzeShotFeelTrend(): {
    A: number,
    B: number,
    C: number,
    percentages: { A: number, B: number, C: number }
  } {
    const allShotFeels = this.rounds.map(round => round.getShotFeel());

    const totalShots = allShotFeels.reduce((total, [A, B, C]) => total + A + B + C, 0);
    const [totalA, totalB, totalC] = allShotFeels.reduce(
      ([sumA, sumB, sumC], [A, B, C]) => [sumA + A, sumB + B, sumC + C],
      [0, 0, 0]
    );

    return {
      A: totalA,
      B: totalB,
      C: totalC,
      percentages: {
        A: (totalA / totalShots) * 100,
        B: (totalB / totalShots) * 100,
        C: (totalC / totalShots) * 100
      }
    };
  }

  // 종합 라운드 리포트 생성
  generateMultiRoundReport() {
    return {
      numberOfRounds: this.rounds.length,
      scoreStatistics: this.getScoreDistribution(),
      girStatistics: this.calculateGIRStatistics(),
      penaltyStatistics: this.calculatePenaltyStatistics(),
      shotFeelAnalysis: this.analyzeShotFeelTrend()
    };
  }
}

export { Shot, Hole, Round, RoundStatistics };
