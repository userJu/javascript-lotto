const {
  PURCHACE_MESSAGE,
  REQUIRE_WIN_NUMBER_MESSAGE,
  RESULT_RANK,
  THIRD,
  FORTH,
  FIFTH,
  FIFTHBONUS,
  SIX,
} = require("../constants/constant");
const LottoNumberGenerator = require("../domain/LottoNumberGenerator");
const MessageOutput = require("../domain/MessageOutput");
const UserInput = require("../domain/UserInput");
const Compare = require("../domain/Compare");

const MissionUtils = require("@woowacourse/mission-utils");
const Calculator = require("../domain/Calculator");
const Lotto = require("../Lotto");
const { ONLY_NUMBER } = require("../utils/validator");

class State {
  lottoInput = 0;
  winNumbers = [];
  bonusNumber = 0;

  moneyInput = 0;
  lottomoneyOutput = 0;

  buyLottoCount = 0;
  buyLottoNumbers = [];

  messageOutput = new MessageOutput();
  lottoNumberGenerator = new LottoNumberGenerator();
  calculator = new Calculator();

  setMoneyInput(userInput) {
    if (!ONLY_NUMBER.test(userInput)) {
      throw new Error("[ERROR] 금액은 숫자만 입력할 수 있습니다");
    }
    this.moneyInput = userInput;
    this.buyLottoCount = parseInt(userInput / 1000);
    // this.messageOutput.printMesage("");
    this.messageOutput.printMesage(`${this.buyLottoCount}${PURCHACE_MESSAGE}`);
    this.pickuserLottos(this.buyLottoCount);
  }
  pickuserLottos(buyLottoCount) {
    const lottos = [];

    for (let count = 1; count <= buyLottoCount; count++) {
      const lotto = this.lottoNumberGenerator.createRandomNumbers();
      MissionUtils.Console.print(lotto);
      lottos.push(lotto);
    }
    // this.messageOutput.printMesage("");

    this.buyLottoNumbers = lottos;
    this.callMessage(REQUIRE_WIN_NUMBER_MESSAGE);
  }

  callMessage(message) {
    // this.messageOutput.printMesage(message);
    this.winNumbersInput(message);
  }

  winNumbersInput(message) {
    MissionUtils.Console.readLine(message, (userInput) => {
      this.setWinNumbersInput(userInput);
    });
  }

  bonusNumbersInput(message) {
    MissionUtils.Console.readLine(message, (userInput) => {
      this.setBonusNumbersInput(userInput);
    });
  }

  setBonusNumbersInput(userInput) {
    const number = parseInt(userInput);
    if (this.isValidate(number) && this.isNotInWinNumbers(number)) {
      this.bonusNumber = userInput;
      const compare = new Compare();
      const resultArray = compare.setResult(
        this.buyLottoNumbers,
        this.winNumbers,
        this.bonusNumber
      );
      this.makeResultMessage();
    }
  }

  makeResultMessage() {
    const messageArr = [THIRD, FORTH, FIFTH, FIFTHBONUS, SIX];
    messageArr.map((arr) => {
      const message = `${arr.condition} (${arr.price}원) - ${arr.count}개`;
      this.messageOutput.printMesage(message);
      this.lottomoneyOutput += arr.count
        ? parseInt(arr.price.split(",").join(""))
        : 0;
    });
    this.calculator.calcReturnMoney(this.lottomoneyOutput, this.moneyInput);
  }

  isNotInWinNumbers(userInput) {
    return !this.winNumbers.includes(userInput) ? true : false;
  }
  isValidate(userInput) {
    return 0 < userInput <= 45 ? true : false;
  }

  setWinNumbersInput(userInput) {
    const splitedNumbers = this.splitNumber(userInput, ",");

    new Lotto(splitedNumbers);
    this.winNumbers = splitedNumbers;
    this.messageOutput.printMesage("");
    this.messageOutput.printMesage("보너스 번호를 입력해 주세요");
    this.bonusNumbersInput("");
  }
  splitNumber(number, flag) {
    return number.split(flag).map((item) => {
      return parseInt(item);
    });
  }
  // isNotNumberDuplicate(numberArr) {
  //   const setNumberArr = new Set(numberArr);
  //   return setNumberArr.size === 6 ? true : false;
  // }

  isValidateNumberRange(numberArr) {
    let flag = true;
    numberArr.map((number) => {
      if (number <= 0 || number > 45) {
        flag = false;
        return;
      }
    });
    return flag;
  }
}

module.exports = State;
