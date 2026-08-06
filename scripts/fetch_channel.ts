import https from 'https';

const instances = [
  "vid.priv.au",
  "inv.nadeko.net",
  "invidious.stratum0.org",
  "yt.artemislena.eu"
];

async function fetchInfo(instanceIdx: number = 0): Promise<any> {
    if (instanceIdx >= instances.length) return console.log('All failed');
    const inst = instances[instanceIdx];
    return new Promise((resolve) => {
        let done = false;
        // fetch videos using search or youtube rss
        const req = https.get('https://' + inst + '/api/v1/search?q=fernandogcortes', (res) => {
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => {
                done = true;
                if (res.statusCode === 200) {
                    try {
                        console.log(data.slice(0, 500));
                        resolve(data);
                    } catch(e) { resolve(fetchInfo(instanceIdx + 1)); }
                } else {
                    resolve(fetchInfo(instanceIdx + 1));
                }
            });
        });
        req.on('error', () => { if(!done) resolve(fetchInfo(instanceIdx + 1)); });
        req.setTimeout(5000, () => {
            req.destroy();
        });
    });
}
fetchInfo();
