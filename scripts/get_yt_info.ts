import https from 'https';

const urls = [
  "sKNlw5S_0PA",
  "6hZfj7OnePQ",
  "agEwV90KxNo",
  "Xto0LJWbqj4",
  "8c1dGRbUlWE",
  "XYBMd04EUaw",
  "klQcV-sX5wI",
  "QsiXj-h4mq8",
  "mHHz1y910Lg",
  "7o7d0NdWFFA",
  "UxWub5bvVpo",
  "zvlIg0oE8v8",
  "InCUFtqtknU",
  "bs-JyFFF5eA",
  "D_di9OmLe1s",
  "6aJwaHbcNjU",
  "JI84XfvOuMg",
  "QbauqDfoRZQ",
  "0KUzExrNZc0",
  "_p6wafQshbI",
  "LmBmabcXZqc"
];

const instances = [
  "invidious.jing.rocks",
  "vid.priv.au",
  "inv.nadeko.net",
  "invidious.stratum0.org",
  "yt.artemislena.eu"
];

async function fetchInfo(id: string, instanceIdx: number = 0): Promise<any> {
    if (instanceIdx >= instances.length) return { id, error: true, msg: 'all failed' };
    const inst = instances[instanceIdx];
    return new Promise((resolve) => {
        let done = false;
        const req = https.get('https://' + inst + '/api/v1/videos/' + id, (res) => {
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => {
                done = true;
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        resolve({ id, date: json.publishedText, year: new Date(json.published * 1000).getFullYear(), desc: json.description });
                    } catch(e) { resolve(fetchInfo(id, instanceIdx + 1)); }
                } else {
                    resolve(fetchInfo(id, instanceIdx + 1));
                }
            });
        });
        req.on('error', () => { if(!done) resolve(fetchInfo(id, instanceIdx + 1)); });
        req.setTimeout(5000, () => {
            req.destroy();
        });
    });
}

async function main() {
    let out = {};
    for (let id of urls) {
        let info: any = await fetchInfo(id);
        out[id] = info;
        console.log(id, "->", info.year);
    }
    const fs = require('fs');
    fs.writeFileSync('yt_data.json', JSON.stringify(out, null, 2));
}
main();
