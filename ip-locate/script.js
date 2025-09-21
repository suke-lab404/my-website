// JavaScriptを書くのは大変久しぶりで懐かしいですね。
import { continentCodeMap,countryMap,countryCapitalMap,regionMap} from "./maps.js"

// 一番上のやつ
let startButton = document.getElementById("start-button");

// ロード中に表示されるやつ
let statusFrame = document.getElementById("status-frame");
let alertIcon = document.getElementById("alert-icon");
let questionIcon = document.getElementById("question-icon");
let checkIcon = document.getElementById("check-icon");
let frownIcon = document.getElementById("frown-icon")
let loadIcon = document.getElementById("load-icon");
let statusMessage = document.getElementById("status-message");
let retryButton = document.getElementById("retry-button");

// リザルト
let resultFrame = document.getElementById("result-frame")
let resultButton = document.getElementById("result-button");
let resultProButton = document.getElementById("result-pro-button")
let resultList = document.getElementById("result-list")
let resultProList = document.getElementById("result-pro-list")
// 値
let result1 = document.getElementById("result1-data") // 大陸
let result2 = document.getElementById("result2-data") // 国
let result3 = document.getElementById("result3-data") // 首都
let result4 = document.getElementById("result4-data") // 都道府県
let result5 = document.getElementById("result5-data") // 地区町村
let result6 = document.getElementById("result6-data") // プロバイダー
let result7 = document.getElementById("result7-data") // IPアドレス

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
}

function resetFirstFrame(){

    startButton.disabled = false

}

function resetLoadFrame(){

    statusFrame.style.display = "none";
    alertIcon.style.display = "none";
    questionIcon.style.display = "none";
    checkIcon.style.display = "none";
    frownIcon.style.display = "none";
    loadIcon.style.display = "none";
    statusMessage.style.display = "none";
    retryButton.style.display = "none";

}

function switchView(info,icon){
    resetLoadFrame();

    statusFrame.style.display = "flex";
    statusMessage.style.display = "block";
    retryButton.style.display = "block";

    let string = String(info)
    statusMessage.textContent = string

    if (icon == "alert"){
        alertIcon.style.display = "block"
    } else if (icon == "question"){
        questionIcon.style.display = "block"
    } else if (icon == "check"){
        checkIcon.style.display = "block"
    } else {
        frownIcon.style.display = "block"
        statusMessage.textContent = "ああ、兄弟。重大なエラーが発生しました。"
    }
}

async function getIP() {
    try{
        const res = await fetch("https://api.ipify.org?format=json");

        if (!res.ok) {
            return [1,""];
        }

        const data = await res.json();
        console.log("IPアドレス：",data.ip);

        return [0,data.ip];

    } catch (error) {
        return [2,""];
    }
}

async function getIpInfo(ip_address) {
    try {
        const response = await fetch(`https://ipapi.co/${ip_address}/json/`);
        if (response.ok) {
            let success = true
            let data = await response.json();
            let continentCode = continentCodeMap[data.continent_code] || data.continent_code; // 大陸コード
            let country = countryMap[data.country_name] || data.country_name; // 国名
            let countryCapital = countryCapitalMap[data.country_capital] || data.country_capital; // 国の首都
            let region = regionMap[data.region] || data.region
            let city = data.city
            let ip_address = data.ip
            let provider = data.org

            // デバッグ
            console.log(`大陸：${continentCode}`)
            console.log(`国：${country}`)
            console.log(`国の首都：${countryCapital}`)
            console.log(`リージョン：${region}`)
            console.log(`シティ：${city}`)
            console.log(`IP：${ip_address}`)
            console.log(`プロバイダー名：${provider}`)

            return {"success":success,"continentCode":continentCode,"country":country,"countryCapital":countryCapital,"region":region,"city":city,"ip":ip_address,"provider":provider}
        } else {
            return {"success":false,"continentCode":"None","country":"None","countryCapital":"None","region":"None","city":"None","ip":"None","provider":"None"}
        }

        return null;
    } catch (error) {
        console.error("通信エラー",error)
        let success = false
        return null;
    }
}

function updateResult(data) {
    result1.textContent = data.continentCode;
    result2.textContent = data.country;
    result3.textContent = data.countryCapital;
    result4.textContent = data.region;
    result5.textContent = data.city;
    result6.textContent = data.provider;
    result7.textContent = data.ip;
}

function calcHeight() {
    let resultHeight = resultList.scrollHeight;
    let resultProHeight = resultProList.scrollHeight;
    resultList.style.setProperty("--result-height",resultHeight + "px")
    resultProList.style.setProperty("--result-pro-height",resultProHeight + "px")
}

function showResult() {
    resultFrame.style.display = "block"
}

function hiddenResult() {
    resultFrame.style.display = "none";
    resultList.classList.remove("open");
    resultProList.classList.remove("open");
    resultButton.classList.remove("open");
    resultProButton.classList.remove("open");
}

// あえて、待機する時間を含めているのは、連打などによる大量のリクエストを防ぐためです。
startButton.addEventListener("click", function() {

    // IPアドレスの取得をリクエストする関数の呼び出し
    (async () => {

        hiddenResult();
        resetLoadFrame();

        startButton.disabled = true;

        statusFrame.style.display = "flex";
        loadIcon.style.display = "block";
        statusMessage.style.display = "block";

        statusMessage.textContent = "IPアドレスを取得中...";

        const [status, ip_address] = await getIP();

        console.log("入手されたデータの確認：",ip_address)

        if (status == 0){
            statusMessage.textContent = "IPアドレスの取得に成功！";

            await sleep(1000)

            statusMessage.textContent = "住所の情報を取得中...";

            let ipData = await getIpInfo(ip_address);

            if (ipData.success == true){
                statusMessage.textContent = "情報の取得に成功！";
                await sleep(1000);

                statusMessage.textContent = "情報を整理中...";

                updateResult(ipData);
                showResult();
                calcHeight();

                switchView("処理が正常に終了しました。","check");


            } else {
                switchView("通信エラー。処理中に接続が切断されたか、サーバーが正常に動作しておりません。","alert");
            }

        } else {
            switchView("通信エラー。ネットワーク接続をご確認ください。","alert");
        }
    })();
});

retryButton.addEventListener("click", function() {
    hiddenResult();
    resetLoadFrame();
    resetFirstFrame();
})

resultButton.addEventListener("click", function() {
    resultButton.classList.toggle("open");
    resultList.classList.toggle("open");
})

resultProButton.addEventListener("click",function() {
    resultProButton.classList.toggle("open");
    resultProList.classList.toggle("open");
})

// 最初に実行しておきたいコード
calcHeight();
hiddenResult();