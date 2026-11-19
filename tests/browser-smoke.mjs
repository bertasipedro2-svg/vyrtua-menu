import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
for (const engine of [chromium, webkit]) {
 const browser=await engine.launch();
 try {
 for(const viewport of [{width:320,height:568},{width:414,height:896},{width:1280,height:800}]){
 const page=await browser.newPage({viewport});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765');
 assert.equal(await page.locator('.product').count(),8);
 await page.locator('#search').fill('acai');
 assert.equal(await page.locator('.product').count(),3);
 await page.locator('[data-add="1"]').click();
 await page.reload();
 assert.match(await page.locator('#cartSummary').innerText(),/1 item/);
 await page.getByRole('button',{name:'Ver pedido'}).click();
 await page.locator('#checkoutButton').click();
 assert.match(await page.locator('#orderPreview').innerText(),/SIMULAÇÃO/);
 assert.equal(new URL(page.url()).hostname,'127.0.0.1');
 await page.locator('[data-delta="-1"]').click();
 assert.equal(await page.locator('#checkoutButton').isDisabled(),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 console.log(engine.name(),viewport,'PASS');
 await page.close();
 }
 } finally {await browser.close()}
}
