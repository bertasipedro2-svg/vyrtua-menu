// Run: node --test tests/menu.test.cjs (Node 20+, no dependencies)
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const script=html.split('<script>').pop().split('</script>')[0];
function setup(){
 const nodes=new Map();
 const context=vm.createContext({document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',open:false,addEventListener(){},showModal(){this.open=true}});return nodes.get(id)}}});
 vm.runInContext(fs.readFileSync('menu-config.js','utf8'),context);
 vm.runInContext(script,context);
 return {run:s=>vm.runInContext(s,context),nodes};
}
test('catalog and accent-insensitive search',()=>{const {run,nodes}=setup();assert.equal(run('items.length'),8);nodes.get('search').value='acai';run('renderProducts()');assert.match(nodes.get('products').innerHTML,/Açaí tradicional/);assert.doesNotMatch(nodes.get('products').innerHTML,/X-Burger/);});
test('cart cents, removal and quantity cap',()=>{const {run}=setup();run('addItem(1);addItem(2)');assert.equal(run('totalCents()'),3880);run('changeItem(1,-1)');assert.equal(run('totalCents()'),2290);run('for(let i=0;i<110;i++)addItem(2)');assert.equal(run('cart[2]'),99);run('addItem(999)');assert.equal(run('cart[999]'),undefined);});
test('escape markup and quoted attributes',()=>{const {run}=setup();assert.equal(run('esc("<img>")'),'&lt;img&gt;');assert.equal(run('esc(String.fromCharCode(34))'),'&quot;');});
test('category filter and empty state',()=>{const {run,nodes}=setup();run('setCategory("Bebidas")');assert.match(nodes.get('products').innerHTML,/Suco natural/);assert.doesNotMatch(nodes.get('products').innerHTML,/X-Burger/);nodes.get('search').value='inexistente';run('renderProducts()');assert.match(nodes.get('products').innerHTML,/Nenhum produto/);});
