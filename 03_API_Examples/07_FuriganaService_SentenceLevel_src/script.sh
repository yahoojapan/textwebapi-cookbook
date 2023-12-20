query=$1

if [ ! "$1" ]; then
  echo "クエリはセットされていません."
  exit 1
fi 

for i in {1..8}; do
  n_furigana=`curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "User-Agent: Yahoo AppID: $APPID" \
    https://jlp.yahooapis.jp/FuriganaService/V2/furigana \
    -d '{
      "id": "1", "jsonrpc": "2.0", "method": "jlp.furiganaservice.furigana",
      "params": {"q": "'$query'", "grade": '$i'}
    }' | jq -cr '[.result.word[] | .furigana ] | join("") | length '`
  if [ $n_furigana -eq 0 ] && [ $i -eq 1 ]; then
    echo "「$1」には漢字が含まれていません。"
    break 
  elif [ $n_furigana -eq 0 ] && [ $i -lt 8 ]; then
    echo "「$1」は小学校$(($i-1))年生以下で習う漢字・熟語で構成されています。"
    break
  elif [ $n_furigana -eq 0 ] && [ $i -eq 8 ]; then
    echo "「$1」は中学校以下で習う漢字・熟語が含まれています。"
  elif [ $i -eq 8 ]; then
    echo "「$1」には常用漢字以外が含まれています。"
  fi
done