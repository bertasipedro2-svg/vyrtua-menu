const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync('index.html','utf8').split('<script>').pop().split('</script>')[0];
for(const [slug,total] of [['espetaria',3000],['lanchonete',4000],['acaiteria',7200]])test(slug,()=>{
 const nodes=new Map(),storage=new Map();
 const setup=()=>{const c=vm.createContext({localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{location:{href:''}},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',addEventListener(){},showModal(){this.open=true}});return nodes.get(id)}}});vm.runInContext(fs.readFileSync(`templates/${slug}.js`,'utf8'),c);vm.runInContext(script,c);return s=>vm.runInContext(s,c)};
 let run=setup();assert.equal(run('configOK && config.demo && config.whatsapp===""'),true);assert.equal(run('items.length'),3);assert.equal((nodes.get('products').innerHTML.match(/<article /g)||[]).length,3);run('items.forEach(p=>addItem(p.id));checkout()');assert.equal(run('totalCents()'),total);assert.equal(run('checkoutUrl()'),null);assert.equal(run('window.location.href'),'');assert.match(nodes.get('orderPreview').textContent,/SIMULAÇÃO/);run=setup();assert.equal(run('totalCents()'),total);
});
