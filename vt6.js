"use strict";
/* globals ReactDOM: false */
/* globals React: false */

const App = React.memo(function(props) {
        // Käytetään lähes samaa dataa kuin viikkotehtävässä 1
        // Alustetaan tämän komponentin tilaksi data.
        // Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan
        // päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi
        // apufunktiot.js sisältää esimerkin, jossa koko data kopioidaan, mutta
        // nykyään voi käyttää myös structuredClone-funktiota, joka osaa suoraan tehdä deepcopyn
        // kts. https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
        // huom. läheskään kaikissa tilanteissa ei kannata kopioida koko dataa vaan ainoastaan muuttunut osa
        // palvelimelta haettava data on syytä pitää kaikki yhdessä tilamuuttujassa
        const [data, setData] = React.useState( {} );
        React.useEffect(() => {
            const fetchfunc = async () => {
                const response = await fetch('https://appro.mit.jyu.fi/cgi-bin/tiea2120/vt3.cgi/');
                let alkudata = await response.json();
                alkudata = alusta_data(alkudata); // huom. älä kutsu alusta_data-funktiota muualla
                setData( alkudata );
            }
            fetchfunc();

         }, []);

      console.log(data);


      /**
       * Lisää uuden joukkueen App komponentin tilaan
       * @param {Object} uusijoukkue 
       */
      let lisaaUusiJoukkue = function(uusijoukkue){
        let dataKopio = structuredClone(data);
        dataKopio.joukkueet.push(uusijoukkue);
        setData(dataKopio);
      }

      return (<div>
    	<LisaaJoukkue data={data} lisaaUusiJoukkue={lisaaUusiJoukkue}/>
    	<ListaaJoukkueet data={data}/>
        </div>);

});

// jos komponenttien toiminnassa on ongelmia, voit kokeilla ensin
// ilman memoa. Valmiiden komponenttien täytyy kuitenkin toimia memon kera.
const LisaaJoukkue = React.memo(function(props) {
    let sarjaNimet = [];
    let leimausTavat = [];
    try {
      
      for (let alkio of props.data.sarjat){
        sarjaNimet.push(alkio.nimi); // Lisätään taulukkoon datasta sarjojen nimet
      }
      
      for (let alkio of props.data.leimaustavat){
        leimausTavat.push(alkio); // Lisätään taulukkoon datasta leimaustavat
      }

    } catch (ex){
      console.log("virhe", ex); // Jos data on tyhjä, otetaan se kiinni ja poistutaan
      return;
    }
    
    // Tilamuuttujien alustus
    const [jasenMap, setJasenMap] = React.useState(new Map());
    const [joukkueenNimi, setJoukkueenNimi] = React.useState("");
    const [selectedSarja, setSelectedSarja] = React.useState(sarjaNimet[0]);

    /**
     * Asettaa joukkueenNimi tilamuuttujalle uuden arvon
     * @param {Event} event 
     */
    let handleNimiInput = function(event){
      setJoukkueenNimi(event.target.value);
    }

    /**
     * Asettaa selectedSarja tilamuuttujalle uuden arvon
     * @param {String} event 
     */
    let handleSarjat = function(value){
      setSelectedSarja(value);
    }

    /**
     * Päivittää jasenMap tilamuuttujaa
     * @param {Number} index 
     * @param {Event} event 
     */
    let handleJasenInput = function(index, event){
      setJasenMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.set(index, event.target.value);
        return newMap; 
      });
    }

    /**
     * Suoritetaan kun tallenna -painiketta on painettu.
     * Funkio:
     * - Hakee kaikki leimaukset, jotka on ruksittu.
     * - Kutsuu joukkueen nimen ja jäsenien tarkistusfunktioita
     * - Hakee jasenMapista jäsenien nimet taulukkoon
     * - Hakee leimauksia vastaavat numerot datasta
     * - Luo uuden joukkueen
     * 
     * Mainituista asioista olisi voinut tehdä omat funktiot
     * @param {Event} e 
     * @returns 
     */
    let handleSubmit = function(e){
        e.preventDefault();
        
        const leimaukset = e.target.leimaustapa;
        const leimausTaulukko = [];
        for (let alkio of leimaukset){
          if (alkio.checked){
            leimausTaulukko.push(alkio.value); // Haetaa kaikki ruksatut leimaukset ja lisätään ne taulukkoon
          }
        }

        // Tarkistetaan joukkueen nimi, jos nimi ei kelpaa niin poistutaan.
        if (!tarkistaJoukkueenNimi(joukkueenNimi, e)){
          console.log("joukkueen lisäys epäonnistui");
          e.target.nimi.setCustomValidity("");
          return;
        }
        // Tarkistetaan jäsenet, jos tarkistus ei mene läpi niin poistutaan.
        if (!tarkistaJasenet(jasenMap, e)){
          console.log("joukkueen lisäys epäonnistui");
          e.target.jasen[0].setCustomValidity("");
          e.target.jasen[1].setCustomValidity("");
          return;
        }
        
        const jasenTaulukko = Array.from(jasenMap.values()); // Haetaan jasenMapista jäsenien nimet ja lisätään ne taulukkoon
        
        // Haetaan datasta leimaustapoja vastaavat numerot
        const leimauksetMap = new Map();
        for (let i = 0; i < props.data.leimaustavat.length; i++){
          leimauksetMap.set(props.data.leimaustavat[i], i);
        }
        // Haetaan käyttäjän valitsemia leimaustapoja vastaavat numerot
        const joukkueenLeimaukset = [];
        for (let i = 0; i < leimausTaulukko.length; i++){
          joukkueenLeimaukset.push(leimauksetMap.get(leimausTaulukko[i]));
        }

        // Luodaan uusi joukkue
        const uusiJoukkue = {
          nimi: joukkueenNimi,
          id: haeID(), // Haetaan joukkueelle uniikki id kutsumalla haeID funktiota
          sarja: {
            alkuaika: "",
            id: 0,
            kesto: 0,
            loppuaika: "",
            nimi: selectedSarja,
            sarjaid: 0,
          },
          jasenet: jasenTaulukko,
          leimaustapa: joukkueenLeimaukset,
          aika: "00:00:00",
          matka: 0,
          pisteet: 0,
          rastileimaukset: [],
        };
        console.log(uusiJoukkue);
        props.lisaaUusiJoukkue(uusiJoukkue); // Kutsutaan joukkueen lisäystä App -komponentissa propsien avulla
        document.forms.lomake.reset(); // Tyhjennetään lomake
        resetState(); // Alustetaan tilamuuttujat uudelleen
    }

    
    /**
     * Tarkistaa onko joukkueen nimi tyhjä tai onko joukkue jo olemassa.
     * Virheistä ilmoitetaan käyttäjälle seCustomValidity ja reportValidity metodien avulla.
     * @param {String} nimi 
     * @param {Event} event 
     * @returns false jos tyhjä tai olemassa, muussa tapauksessa true
     */
    let tarkistaJoukkueenNimi = function(nimi, event){
      const nimikentta = event.target.nimi;
      nimi = nimi.trim().toUpperCase();
      if (nimi.length === 0){
        nimikentta.setCustomValidity("nimi ei saa olla tyhjä");
        nimikentta.reportValidity();
        return false;
      }

      for (let alkio of props.data.joukkueet){
        if (nimi === alkio.nimi.trim().toUpperCase()){
          nimikentta.setCustomValidity("joukkue on jo olemassa");
          nimikentta.reportValidity();
          return false;
        }
      }
      return true;
    }

    /**
     * Tarkistaa onko yhtään jäsentä lisätty kenttään 1 tai 2.
     * Virheistä ilmoitetaan käyttäjälle seCustomValidity ja reportValidity metodien avulla.
     * @param {Map} jasenetMap 
     * @param {Event} event 
     * @returns false jos kenttä 1 tai 2 on tyhjä, muussa tapauksessa true
     */
    let tarkistaJasenet = function(jasenetMap, event){
      const jasenkentat = event.target.jasen;
      if (jasenetMap.size === 0){
        jasenkentat[0].setCustomValidity("lisää vähintään 1 jäsen");
        jasenkentat[0].reportValidity();
        return false;
      }

      if (!jasenMap.has(1)){
        jasenkentat[0].setCustomValidity("lisää vähintään 1 jäsen kenttään 1");
        jasenkentat[0].reportValidity();
        return false;
      }

      if (jasenMap.get(1).trim().length === 0){
        jasenkentat[0].setCustomValidity("kenttä ei saa olla tyhjä");
        jasenkentat[0].reportValidity();
        return false;
      }

      if (!jasenMap.has(2)){
        jasenkentat[1].setCustomValidity("lisää vähintään 1 jäsen kenttään 2");
        jasenkentat[1].reportValidity();
        return false;
      }

      if (jasenMap.get(2).trim().length === 0){
        jasenkentat[1].setCustomValidity("kenttä ei saa olla tyhjä");
        jasenkentat[1].reportValidity();
        return false;
      }
      return true;
    }

    /**
     * Käy läpi kaikki joukkueet datasta ja etsii suurimman ID:n.
     * ID:seen lisätään 1 ja palautetaan.
     * @returns suurin löydetty ID + 1
     */
    let haeID = function(){
      let suurinID = 0;
      for (let alkio of props.data.joukkueet){
        if (alkio.id > suurinID) {
          suurinID = alkio.id;
        }
      }
      return suurinID + 1;
    }

    /**
     * Alustaa kaikki tilamuuttujat uudestaan.
     */
    let resetState = function(){
      setJasenMap(new Map());
      setJoukkueenNimi("");
      setSelectedSarja(sarjaNimet[0]);
    }


      return (<form id="lomake" onSubmit={handleSubmit} action="https://appro.mit.jyu.fi/cgi-bin/view.cgi" method="post">
        <h1>Lisää joukkue</h1>
        <Joukkueentiedot handleNimiInput={handleNimiInput} handleSarjat={handleSarjat} leimaustavat={leimausTavat} sarjanimet={sarjaNimet} selectedSarja={selectedSarja}/>
        <Jasenet handleJasenInput={handleJasenInput}/>
        <button type="submit">Tallenna</button>
        </form>);

});

/**
 * Komponentti vie propseista saadut parametrit eteenpäin Leimaustavat ja Sarjaradiot komponenteille
 */
const Joukkueentiedot = React.memo(function(props){
  return (<fieldset id="joukkueentiedot">
    <legend>Joukkueen tiedot</legend>
    <label>Nimi <input id="joukkueennimi" type="text" name="nimi" onChange={(event) => props.handleNimiInput(event)} required/></label>
    <Leimaustavat leimaustavat={props.leimaustavat} />
    <Sarjaradiot sarjanimet={props.sarjanimet} handleSarjat={props.handleSarjat} selectedSarja={props.selectedSarja}/>
    </fieldset>)
});

/**
 * Komponentti lisää kaikki datasta saadut leimaustavat näkyviin sovellukseen
 */
const Leimaustavat = React.memo(function(props){
  const labels = [];
  let i = 0;
  for (let alkio of props.leimaustavat){
    let label = <label key={i++}>{alkio}<input type="checkbox" name="leimaustapa" value={alkio} /></label>
    labels.push(label);
  }

  return (<span><div>Leimaustavat</div>
    <div id="leimaustavat">
    {labels}
    </div>
    </span>)
});

/**
 * Komponentti lisää kaikki datasta saadut sarjat näkyviin sovellukseen
 * Jokainen radiobutton kutsuu muutoksen yhteydessä kautta handleRadioChange funktiota.
 */
const Sarjaradiot = React.memo(function(props){

  /**
   * Välittää parametrina saadun sarjan eteenpäin propsien avulla handleSarjat funktiolle.
   * Jokainen radiobutton saa propsien kautta selectedSarja tilamuuttujan, jonka avulla voidaan tarkistaa onko kyseinen sarja valittuna
   * @param {String} valittusarja 
   */
  let handleRadioChange = function(valittusarja){
    props.handleSarjat(valittusarja);
  }

  const labels = [];
  for (let i = 0; i < props.sarjanimet.length; i++){
    let label = <label key={i}>{props.sarjanimet[i]}<input type="radio" name="sarja" checked={props.selectedSarja === props.sarjanimet[i]} onChange={() => handleRadioChange(props.sarjanimet[i])}/></label>
    labels.push(label);
  }
  
  return (<span><div>Sarja</div>
    <div id="sarjaradiot">
    {labels}
    </div>
    </span>)
});

/**
 * Komponentti lisää 5 jäsenkenttää. 
 * Jokainen kenttä kutsuu muutoksen yhteydessä propsien kautta handleJasenInput funktiota.
 */
const Jasenet = React.memo(function(props){

  let jasenet = [];
  for (let i = 1; i <= 5; i++){
    let jasen = <label key={i}>Jäsen {i} <input key={i} type="text" name="jasen" onChange={(event) => props.handleJasenInput(i, event)} /></label>
    jasenet.push(jasen);
  }

  return (<fieldset id="jasentiedot">
    <legend>Jäsenet</legend>
    <div id="jasenkentat">
    {jasenet}
    </div>
  </fieldset>)
});

/**
 * Komponentti listaa kaikki datasta saadut joukkueet näkyviin sovellukseen ja järjestää ne.
 */
const ListaaJoukkueet = React.memo(function(props) {
      
      const joukkueTaulukko = [];
      try {
        for (let alkio of props.data.joukkueet){
          joukkueTaulukko.push(alkio); // Lisätään kaikki joukkueet datasta uuteen taulukkoon
        }

        // Järjestetään taulukko ensin sarjan mukaan ja sitten joukkueen nimen mukaan
        joukkueTaulukko.sort((a,b) => {
          let aNimi = a.nimi.toUpperCase().trim();
          let bNimi = b.nimi.toUpperCase().trim();
          let aSarja = a.sarja.nimi.toUpperCase().trim();
          let bSarja = b.sarja.nimi.toUpperCase().trim();
          if (aSarja < bSarja){
              return -1;
          } 
          if (aSarja > bSarja){
              return 1;
          }
          if (aNimi < bNimi){
              return -1;
          }
          if (aNimi > bNimi){
              return 1;
          }
          return 0;
      });


      /**
       * Hakee joukkueen leimaustavat ja palauttaa ne merkkijonona
       * @param {Object} joukkue 
       * @returns 
       */
      let haeLeimaukset = function(joukkue){

        let leimauksetMap = new Map();
        for (let i = 0; i < props.data.leimaustavat.length; i++){
          leimauksetMap.set(i, props.data.leimaustavat[i]);
        }
        
        let leimauksetTaulukko = [];
        for (let i = 0; i < joukkue.leimaustapa.length; i++){
          leimauksetTaulukko.push(joukkue.leimaustapa[i]);
        }

        let joukkueenLeimaustavat = [] 
        for (let i = 0; i < leimauksetTaulukko.length; i++){
          joukkueenLeimaustavat.push(leimauksetMap.get(leimauksetTaulukko[i]));
        }

        joukkueenLeimaustavat.sort();
        return joukkueenLeimaustavat.join(", ");
      }


      let joukkueet = [];
      let i = 0;
      for (let alkio of joukkueTaulukko){
        let joukkue = <tr key={i++}>
          <td>{alkio.sarja.nimi}</td>
          <td>{alkio.nimi} ({haeLeimaukset(alkio)})</td>
          </tr>
          joukkueet.push(joukkue);
      }

      return (<table>
        <thead>
            <tr>
                <th>Sarja</th>
                <th>Joukkue</th>
            </tr>
        </thead>
        <tbody>
        {joukkueet}
        </tbody>
        </table>);

} catch (ex){
  console.log("virhe joukkueiden listauksessa", ex);
}
      
});


const root = ReactDOM.createRoot( document.getElementById('root'));
root.render(
      /* jshint ignore:start */
    <App />,
      /* jshint ignore:end */
);

