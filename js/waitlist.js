(function(){
'use strict';
const config=window.MARIAGES_2028||{},form=document.getElementById('waitlistForm'),button=document.getElementById('submitButton'),message=document.getElementById('formMessage');
const api=String(config.API_URL||'').replace(/\/+$/,'');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!form)return;
if(!/^https:\/\/[^\s]+$/.test(api)){message.innerHTML='Les inscriptions ouvriront bientôt. Vous pouvez déjà m’écrire à <a href="mailto:latelierfleursetsens@gmail.com">latelierfleursetsens@gmail.com</a>.';return;}
button.disabled=false;
let busy=false;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;busy=true;button.disabled=true;button.textContent='Enregistrement en cours…';message.textContent='';message.className='setup-note';
 const raw=Object.fromEntries(new FormData(form).entries());raw.consent=raw.consent==='on';
 try{
  const response=await fetch(api+'/inscriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(raw),signal:AbortSignal.timeout(45000)});
  let result;try{result=await response.json();}catch{throw new Error('L’inscription n’a pas pu être confirmée. Merci de réessayer.');}
  if(!response.ok||!result.ok)throw new Error(result.error||'L’inscription n’a pas pu être confirmée.');
  const card=document.getElementById('inscription');card.className='form-card confirmation';card.tabIndex=-1;card.setAttribute('role','status');
  const intro=result.existing?'Votre adresse e-mail figure déjà sur la liste pour cette date de mariage. Votre inscription est bien prise en compte.':'Merci de me faire une petite place dans les préparatifs de votre grand jour.';
  const mail=result.clientEmailStatus==='sent'?'Un e-mail de confirmation a été envoyé à '+escape(raw.email)+'. Pensez à vérifier vos courriers indésirables.':result.existing?'Vous n’avez rien à faire de plus. Pour corriger vos coordonnées, contactez-moi par e-mail.':'Votre inscription est bien enregistrée. L’envoi de l’e-mail de confirmation n’a pas encore été confirmé.';
  card.innerHTML='<div class="success-seal" aria-hidden="true">✓</div><span class="eyebrow">VOTRE INSCRIPTION EST ENREGISTRÉE</span><h2>À bientôt,<br><em>'+escape(raw.firstName.trim())+' !</em></h2><p>'+intro+'</p><div class="spring-note"><p>Je reviendrai vers vous au <strong>printemps 2027</strong>, après la mise à jour de mes tarifs, pour parler de votre projet floral.</p></div><p class="mail-note">'+mail+'</p><p class="signature">Élodie<span>L’Atelier Fleurs &amp; Sens</span></p><p class="micro">Cette inscription ne réserve pas votre date de mariage.</p>';
  card.focus();card.scrollIntoView({behavior:'smooth',block:'center'});
 }catch(error){message.className='error-message';message.textContent=error.name==='TimeoutError'?'L’enregistrement n’a pas pu être confirmé à temps. Réessayez avec la même adresse e-mail : votre inscription ne sera pas ajoutée en double.':error.message||'La connexion a échoué. Merci de réessayer.';}
 finally{busy=false;if(document.contains(button)){button.disabled=false;button.textContent='Rejoindre la liste d’attente →';}}
});
})();
