const APPID = 'あなたの Client ID（アプリケーション ID）';
async function yapifuri(query) {
    const url = "https://jlp.yahooapis.jp/FuriganaService/V2/furigana?appid=" + encodeURIComponent(APPID);
    const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            "id": "A123",
            "jsonrpc" : "2.0",
            "method" : "jlp.furiganaservice.furigana",
            "params" : { "q" : query, "grade" : 1 }
        }),
    });
    return res.json();
}

async function proc_selection() {
    const e = document.querySelector("#selected_text");
    if (! e) return;
    e.innerHTML = e.innerHTML.replace(/<rt>.*?<\/rt>/g,'');
    const j = await yapifuri(e.textContent);
    if (! j.result.word) return;
    e.innerHTML = j.result.word.map(x =>
        x.furigana ?
            `<ruby>${x.surface}<rt>${x.furigana}</rt></ruby>` :
            x.surface
    ).join("");
    unwrap_selection();
}

document.onmouseup = function() {
    const selection = document.getSelection();
    if (selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    unwrap_selection();

    const selected_text = document.createElement('span');
    selected_text.id = "selected_text";
    selected_text.style.backgroundColor = 'pink';
    selected_text.onclick = (event) => unwrap_selection();
    range.surroundContents(selected_text);

    const btn = document.createElement('span');
    btn.id = "button_selected_text";
    btn.style.padding = "0 0.5em";
    btn.style.backgroundColor = "red";
    btn.style.cursor = 'pointer';
    btn.onclick = (event) => proc_selection();
    selected_text.after(btn);
};

function unwrap_selection() {
    const e = document.querySelector("#selected_text");
    if (!e) return;
    while (e.firstChild) e.parentNode.insertBefore(e.firstChild, e);
    e.remove();
    document.querySelector("#button_selected_text").remove()
}
