// Run: node --test tests/menu.test.cjs (Node 20+, no dependencies)
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const script=html.split('<script>').pop().split('</script>')[0];
function setup(storage=new Map(),configure=()=>{}){
 const nodes=new Map();
 const context=vm.createContext({localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{location:{href:''}},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',open:false,addEventListener(){},showModal(){this.open=true}});return nodes.get(id)}}});
 vm.runInContext(fs.readFileSync('menu-config.js','utf8'),context);
 configure(context.MENU_CONFIG);
 vm.runInContext(script,context);
 return {run:s=>vm.runInContext(s,context),nodes};
}
test('catalog and accent-insensitive search',()=>{const {run,nodes}=setup();assert.equal(run('items.length'),8);nodes.get('search').value='acai';run('renderProducts()');assert.match(nodes.get('products').innerHTML,/Açaí tradicional/);assert.doesNotMatch(nodes.get('products').innerHTML,/X-Burger/);});
test('cart cents, removal and quantity cap',()=>{const {run}=setup();run('addItem(1);addItem(2)');assert.equal(run('totalCents()'),3880);run('changeItem(1,-1)');assert.equal(run('totalCents()'),2290);run('for(let i=0;i<110;i++)addItem(2)');assert.equal(run('cart[2]'),99);run('addItem(999)');assert.equal(run('cart[999]'),undefined);});
test('escape markup and quoted attributes',()=>{const {run}=setup();assert.equal(run('esc("<img>")'),'&lt;img&gt;');assert.equal(run('esc(String.fromCharCode(34))'),'&quot;');});
test('category filter and empty state',()=>{const {run,nodes}=setup();run('setCategory("Bebidas")');assert.match(nodes.get('products').innerHTML,/Suco natural/);assert.doesNotMatch(nodes.get('products').innerHTML,/X-Burger/);nodes.get('search').value='inexistente';run('renderProducts()');assert.match(nodes.get('products').innerHTML,/Nenhum produto/);});

test('demo checkout never navigates',()=>{const {run,nodes}=setup();run('addItem(1);checkout()');assert.equal(run('checkoutUrl()'),null);assert.equal(run('window.location.href'),'');assert.match(nodes.get('orderPreview').textContent,/SIMULAÇÃO/);});
test('real checkout builds encoded URL without sending',()=>{const {run}=setup(new Map(),c=>{c.demo=false;c.whatsapp='5511999999999'});run('addItem(1)');assert.match(run('checkoutUrl()'),/^https:\/\/wa\.me\/5511999999999\?text=/);assert.match(decodeURIComponent(run('checkoutUrl()')),/Açaí tradicional/);});
test('invalid config fails closed',()=>{const {run,nodes}=setup(new Map(),c=>{c.demo=false;c.whatsapp='invalid'});assert.equal(run('configOK'),false);assert.equal(nodes.get('checkoutButton').disabled,true);assert.equal(run('checkoutUrl()'),null);});
test('cart survives reload and ignores corrupted quantities',()=>{const storage=new Map();let a=setup(storage);a.run('addItem(1)');let b=setup(storage);assert.equal(b.run('totalCents()'),1590);storage.set(b.run('storageKey'),'{"1":1000,"2":2,"999":5}');assert.equal(setup(storage).run('totalCents()'),4580);});
test('different storefronts do not share cart',()=>{const storage=new Map();setup(storage).run('addItem(1)');assert.equal(setup(storage,c=>{c.name='Outra loja'}).run('totalCents()'),0);});

test('reject duplicate IDs and fractional cents',()=>{for(const change of [c=>c.items[1].id=c.items[0].id,c=>c.items[0].price=1.001])assert.equal(setup(new Map(),change).run('configOK'),false);});
test('empty cart and invalid quantity changes cannot checkout',()=>{const {run,nodes}=setup();run('checkout();addItem(1);changeItem(1,1000)');assert.equal(run('cart[1]'),1);run('changeItem(1,-1);checkout()');assert.equal(nodes.get('checkoutButton').disabled,true);assert.equal(run('window.location.href'),'');});
test('malicious product markup is escaped',()=>{const {nodes}=setup(new Map(),c=>{c.items[0].name='<img src=x onerror=alert(1)>';});assert.doesNotMatch(nodes.get('products').innerHTML,/<img src=x/);assert.match(nodes.get('products').innerHTML,/&lt;img/);});
