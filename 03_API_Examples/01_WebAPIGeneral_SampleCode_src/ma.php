<?php

$appid = "あなたの Client ID（アプリケーション ID）";
$ep = "https://jlp.yahooapis.jp/MAService/V2/parse";

$query = "今日は良い天気です。";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $ep);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_USERAGENT, "Yahoo AppID: ".$appid);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
     "id" => "1",
     "jsonrpc" => "2.0",
     "method" => "jlp.maservice.parse",
     "params" => [ "q" => $query ]
]));
$obj = json_decode(curl_exec($ch), true);
curl_close($ch);

print(implode(" ", array_map(function($x) { return $x[0].":".$x[3]; }, $obj['result']['tokens'])));
print("\n");

?>
