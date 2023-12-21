const express = require("express");
const router = express.Router();
const lightwallet = require("eth-lightwallet");
const fs = require("fs");

router.post("/newMnemonic", async (req, res) => {
  let mnemonic;
  try {
    mnemonic = lightwallet.keystore.generateRandomSeed();
    res.send({ mnemonic });
  } catch (err) {
    console.log(err);
  }
});

router.post("/newWallet", async (req, res) => {
  // password 와 mnemonic 변수를 만듭니다.
  let password = req.body.password;
  let mnemonic = req.body.mnemonic;
  // 요청에 포함되어 있는 password 와 mnemonic을 각 변수에 할당합니다.

  try {
    lightwallet.keystore.createVault(
      {
        // 첫번째 인자(options)에는 password, seedPhrase, hdPathString을 담습니다.
        password: password,
        seedPhrase: mnemonic,
        hdPathString: "m/0'/0'/0'",
      },
      function (err, ks) {
        // 두번째 인자(callback)에는 키스토어를 인자로 사용하는 함수를 만듭니다.
        ks.keyFromPassword(password, function (err, pwDerivedKey) {
          // 첫번째 인자에는 password, 두번째 인자(callback)에는 pwDerivedKey를 인자로 사용하는 함수를 만듭니다.
          ks.generateNewAddress(pwDerivedKey, 1);
          // 새로운 주소 생성 함수
          let address = ks.getAddresses().toString();
          let keystore = ks.serialize();
          // keystore.getAddresses()을 문자열로 할당합니다.
          // keystore.serialize()을 할당합니다.
          fs.writeFile("wallet.json", keystore, function (err, data) {
            // 첫번째 인자에는 .json 형식의 파일이름을, 두번째 인자에는 keystore 을 입력합니다. 세번째 인자에는 응답에 대한 콜백 함수를 입력합니다.
            if (err) {
              // 로컬 서버에 파일을 저장하기 때문에, 응답으로는 성공 또는 실패 메세지만 전송합니다.
              res.json({ code: 999, message: "실패" });
            } else {
              res.json({ code: 1, message: "성공" });
            }
          });
        });
      }
    );
  } catch (exception) {
    console.log("NewWallet ==>>>> " + exception);
  }
});

module.exports = router;
