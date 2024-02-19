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
    	<LisaaJoukkue />
    	<ListaaJoukkueet />
        </div>);
      /* jshint ignore:end */
});

// jos komponenttien toiminnassa on ongelmia, voit kokeilla ensin
// ilman memoa. Valmiiden komponenttien täytyy kuitenkin toimia memon kera.

const LisaaJoukkue = React.memo(function(props) {
      /* jshint ignore:start */
      return (<form>
        </form>);
      /* jshint ignore:end */
});


const ListaaJoukkueet = React.memo(function(props) {
      /* jshint ignore:start */
      return (<table>
        </table>);
      /* jshint ignore:end */
});


const root = ReactDOM.createRoot( document.getElementById('root'));
root.render(
      /* jshint ignore:start */
    <App />,
      /* jshint ignore:end */
);

