// datarakenteen kopioiminen
// joukkueen leimausten rasti on viite rastitaulukon rasteihin
// joukkueen sarja on viite sarjataulukon sarjaan
let kopioi_kilpailu = function(data) {
        let kilpailu = {};
        kilpailu.nimi = data.nimi;
        kilpailu.loppuaika = data.loppuaika;
        kilpailu.alkuaika = data.alkuaika;
        kilpailu.kesto = data.kesto;
        kilpailu.leimaustavat = Array.from( data.leimaustavat );
        let uudet_rastit = new Map(); // tehdään uusille rasteille jemma, josta niiden viitteet on helppo kopioida
        function kopioi_rastit(j) {
            	        let uusir = {};
            	        uusir.id = j.id;
            	        uusir.koodi = j.koodi;
            	        uusir.lat = j.lat;
            	        uusir.lon = j.lon;
 			uudet_rastit.set(j, uusir); // käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan
            	        return uusir; 
        }
        kilpailu.rastit = Array.from( data.rastit, kopioi_rastit );
        let uudet_sarjat = new Map(); // tehdään uusille sarjoille jemma, josta niiden viitteet on helppo kopioida
        function kopioi_sarjat(j) {
            	        let uusir = {};
            	        uusir.id = j.id;
            	        uusir.nimi = j.nimi;
            	        uusir.kesto = j.kesto;
            	        uusir.loppuaika = j.loppuaika;
            	        uusir.alkuaika = j.alkuaika;
            			uudet_sarjat.set(j, uusir); // käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan
            	        return uusir; 
        }
        kilpailu.sarjat = Array.from( data.sarjat, kopioi_sarjat );
        function kopioi_joukkue(j) {
                    let uusij = {};
                    uusij.nimi = j.nimi;
                    uusij.id = j.id;
            	    uusij.sarja = uudet_sarjat.get(j.sarja);

                    uusij["jasenet"] = Array.from( j["jasenet"] );
	            function kopioi_leimaukset(j) {
            	        let uusir = {};
            	        uusir.aika = j.aika;
            	        uusir.rasti = uudet_rastit.get(j.rasti); // haetaan vanhaa rastia vastaavan uuden rastin viite
            	        return uusir;
	            }
                    uusij["rastileimaukset"] = Array.from( j["rastileimaukset"], kopioi_leimaukset );
                    uusij["leimaustapa"] = Array.from( j["leimaustapa"] );
                    return uusij;
        }

        kilpailu.joukkueet = Array.from( data.joukkueet, kopioi_joukkue);
	return kilpailu;
}


// sekoittaa hieman dataa, mutta myös tekee tarvittavat viitteet
// joukkueen leimausten rasti on viite rastitaulukon rasteihin
// joukkueen sarja on viite sarjataulukon sarjaan
// älä kutsu tätä muualla kuin datan latausvaiheen jälkeen
let alusta_data = function(data)
{

    let old = Array.from(data.leimaustavat);
    data.leimaustavat = shuffle(data.leimaustavat);
    let leimauschange = {};
    for(let i=0;i<old.length; i++) {
          let uusi = data.leimaustavat.findIndex(l => l == old[i]);
          leimauschange[i] = uusi;
    }


    for(let j of data.joukkueet)  {
      for(let i=0;i<j.leimaustapa.length;i++) {
           j.leimaustapa[i] = leimauschange[i];
      }
      for(let s of data.sarjat) {
        if (j.sarja == s.sarjaid ) {
           j.sarja = s;
        }
      }
    }

    // Luodaan myös sarjojen ja leimaustapojen nimet, määrät ja järjestys satunnaisiksi
    let sarjalkm = getRandomInt(4,8);
    let sarjat = shuffle(["kaksi tuntia","4h","8h","kuusi tuntia","3h","5h","7h","1h"]);
    let kestot = shuffle([1,2,3,4,5,6,7,8]);

    let randomit = [];

    for(let i=0;i<sarjalkm;i++) {
      let sarja = data.sarjat[i];
      if ( !sarja ) {
         sarja = {};
         sarja.alkuaika = null;
         sarja.loppuaika = null;
         data.sarjat.push(sarja);
      }
         let uusi_id = getRandomInt(1,100); // tämä ei ole kestävä tapa kehitellä id:tä, mutta pätee nyt tässä tilanteessa
         while(  randomit.includes( uusi_id ) ){
            uusi_id = getRandomInt(1,100);
         }
         randomit.push(uusi_id);
         sarja.id = uusi_id;
      sarja.nimi = sarjat.pop();
      sarja.kesto = kestot.pop();
    }


    let rastit = {};

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); 
    }

    function makeid(length, characters='ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        let result           = '';
    //    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }

    randomit = new Set();
    while( randomit.size < 10 ) {
      randomit.add( getRandomInt(0,100) )
    }

    // pienellä todennäköisyydellä voi antaa kaksi samanlaista rastikoodia
    for(let i=0;i<getRandomInt(4,8);i++) {
       let r;
       if (getRandomInt(0,2)) {
          r = makeid(2)+getRandomInt(1,99);
       }
       else {
          r = ""+getRandomInt(1,99)+makeid(2);
       }
       let id = randomit.values().next().value;
       let rasti = { "id": id,
               "koodi": r,
               "lat": data.rastit[getRandomInt(0, data.rastit.length)].lat,
               "lon": data.rastit[getRandomInt(0, data.rastit.length)].lon,
       }
      randomit.delete(id);
       data.rastit.push(rasti);
    }


    for(let rasti of data.rastit) {
        rastit[rasti.tunniste] = rasti;
    }

    randomit = new Set();
    while( randomit.size < data.joukkueet.length ) {
      randomit.add( getRandomInt(0,100) )
    }

    for(let joukkue of data.joukkueet) {
      for(let rasti of joukkue.rastileimaukset) {
           let r = rastit[ parseInt(rasti.rasti) ] ;
           if ( r ) {
                   rasti.rasti = r;
           }
      }
      let id = randomit.values().next().value;
      joukkue.id = id;
      randomit.delete(id);
      joukkue.pisteet = 0;
      joukkue.matka = 0;
      joukkue.aika = "00:00:00";
      joukkue.rastileimaukset = shuffle(joukkue.rastileimaukset);
      Object.freeze(joukkue.rastileimaukset);
      joukkue.jasenet = shuffle(joukkue.jasenet);
    }


    randomit = new Set();
    while( randomit.size < data.rastit.length ) {
      randomit.add( getRandomInt(0,1000) )
    }


    for(let rasti of data.rastit) {
      let id = randomit.values().next().value;
      rasti.tunniste = id;
      randomit.delete(id);
      Object.freeze(rasti);
    }



    data.joukkueet = shuffle(data.joukkueet);
    data.rastit = shuffle(data.rastit);

    Object.freeze(data.rastit);
    Object.freeze(data.leimaustavat);
    Object.freeze(data.joukkueet);
    Object.freeze(data.sarjat);
    Object.freeze(data);

    for( let joukkue of data.joukkueet ) {
      Object.freeze(joukkue);
    }

    for( let sarja of data.sarjat ) {
      Object.freeze(sarja);
    }

    for( let tapa of data.leimaustavat ) {
      Object.freeze(tapa);
    }

    return data;
    // Fisher-Yates Shuffle
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

}


