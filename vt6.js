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
      /* jshint ignore:start */
      return (<div>
    	<LisaaJoukkue data={data}/>
    	<ListaaJoukkueet data={data}/>
        </div>);
      /* jshint ignore:end */
});

// jos komponenttien toiminnassa on ongelmia, voit kokeilla ensin
// ilman memoa. Valmiiden komponenttien täytyy kuitenkin toimia memon kera.
const LisaaJoukkue = React.memo(function(props) {
      /* jshint ignore:start */
    let sarjaNimet = [];
    let leimausTavat = [];
    const [jasenMap, setJasenMap] = React.useState(new Map());
    const [joukkueenNimi, setJoukkueenNimi] = React.useState("");
    const [sarjanNimi, setSarjanNimi] = React.useState("");
    const [leimausTapa, setLeimausTapa] = React.useState("");

    try {
      
      for (let alkio of props.data.sarjat){
        sarjaNimet.push(alkio.nimi);
      }
      
      for (let alkio of props.data.leimaustavat){
        leimausTavat.push(alkio);
      }

    }catch (ex){
      console.log("virhe", ex);
    }

    let handleNimiInput = function(event){
      setJoukkueenNimi(event.target.value);
      console.log(joukkueenNimi);
    }

    let handleSarjat= function(value){
      setSarjanNimi(value);
      console.log(sarjanNimi);
    }

    let handleLeimausTavat = function(value){
      setLeimausTapa(value);
      console.log(leimausTapa);
    }

    let handleJasenInput = function(index, event){
      setJasenMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.set(index, event.target.value);
        return newMap; 
      });
    }

    let handleSubmit = function(e){
        e.preventDefault();
        let jasenTaulukko = Array.from(jasenMap.values());
        console.log(jasenTaulukko);
        let uusiJoukkue = {
          nimi: joukkueenNimi,
          sarja: sarjanNimi,
          jasenet: jasenTaulukko,
          leimaustapa: leimausTapa,
          aika: "00:00:00",
          matka: 0,
          pisteet: 0,
          rastileimaukset: [],
          sarja: {},
        };
        console.log(uusiJoukkue);
    }


      return (<form id="lomake" action="https://appro.mit.jyu.fi/cgi-bin/view.cgi" method="post">
        <Joukkueentiedot handleNimiInput={handleNimiInput} handleSarjat={handleSarjat} handleLeimausTavat={handleLeimausTavat} leimaustavat={leimausTavat} sarjanimet={sarjaNimet}/>
        <Jasenet handleJasenInput={handleJasenInput}/>
        <button onClick={handleSubmit}>Tallenna</button>
        </form>);
      /* jshint ignore:end */
});

const Joukkueentiedot = React.memo(function(props){
  return (<fieldset id="joukkueentiedot">
    <legend>Joukkueen tiedot</legend>
    <label>Nimi <input id="joukkueennimi" type="text" name="nimi" onChange={(event) => props.handleNimiInput(event)} required/></label>
    <Leimaustavat leimaustavat={props.leimaustavat} handleLeimausTavat={props.handleLeimausTavat}/>
    <Sarjaradiot sarjanimet={props.sarjanimet} handleSarjat={props.handleSarjat}/>
    </fieldset>)
});

const Leimaustavat = React.memo(function(props){
  const labels = [];
  let i = 0;
  for (let alkio of props.leimaustavat){
    let label = <label key={i++}>{alkio}<input type="checkbox" name="leimaustapa" onClick={() => props.handleLeimausTavat(alkio)}/></label>
    labels.push(label);
  }

  return (<span><div>Leimaustavat</div>
    <div id="leimaustavat">
    </div>
    {labels}
    </span>)
});

const Sarjaradiot = React.memo(function(props){
  const labels = [];
  let i = 0;
  for (let alkio of props.sarjanimet){
    let label = <label key={i++}>{alkio}<input type="radio" name="sarja" onClick={() => props.handleSarjat(alkio)}/></label>
    labels.push(label);
  }

  return (<span><div>Sarja</div>
    <div id="sarjaradiot">
    </div>
    {labels}
    </span>)
});

const Jasenet = React.memo(function(props){

  let jasenet = [];
  for (let i = 1; i <= 5; i++){
    let jasen = <label key={i}>Jäsen {i} <input type="text" name="jasen" onChange={(event) => props.handleJasenInput(i, event)} /></label>
    jasenet.push(jasen);
  }

  return (<fieldset id="jasentiedot">
    <legend>Jäsenet</legend>
    {jasenet}
  </fieldset>)
});


const ListaaJoukkueet = React.memo(function(props) {
      /* jshint ignore:start */
      const joukkueTaulukko = [];
      try {
        for (let alkio of props.data.joukkueet){
          joukkueTaulukko.push(alkio);
        }


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
      /* jshint ignore:end */
});


const root = ReactDOM.createRoot( document.getElementById('root'));
root.render(
      /* jshint ignore:start */
    <App />,
      /* jshint ignore:end */
);

