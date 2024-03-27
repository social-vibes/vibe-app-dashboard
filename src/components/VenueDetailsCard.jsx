import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { db } from '../../firebase/firebaseConfig'; 
import { collection, addDoc, setDoc, doc } from "firebase/firestore"; 
const mBoxBaseUrl = import.meta.env.VITE_MAPBOX_BASE_URL; //for static map image 
const mBoxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; //for static map image;


export default function VenueDetailsCard({ selectedVenue, venueDetails }) {
  const venueCategories = ["Bar", 'Club', 'Restaurant'];
  const venueFeatures = ["Alcohol", "Food", "No Cover", "Coat Check", "Dress Code", "Music", "Parking", "WiFi", "Outdoor Seating", "Dance Floor", "Happy Hour", "Reservations", "Bottle Service"];
  const [venueDescription, setVenueDescription] = useState(''); //allow user to update venue description
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(3);   
  const [savingVenue, setSavingVenue] = useState(false);     

  useEffect(() => {
    setVenueDescription(venueDetails?.description || '');
    setSelectedCategories('');
    setSelectedFeatures([]);
  }, [venueDetails]);


  const venue ={
    venueId: crypto.randomUUID(),
    name: selectedVenue.name, //CORE
    address: selectedVenue.location.formatted_address, //CORE (place search api)
    latitude: selectedVenue.geocodes.main.latitude, //CORE
    longitude: selectedVenue.geocodes.main.longitude, //CORE
    website: venueDetails.website || '',  //DETAILS (place details api)
    phone: venueDetails.tel || '',  //DETAILS
    description: venueDetails.description || venueDescription, //DETAILS
    hours: venueDetails.hours.regular || "N/A", //DETAILS
    hoursDisplay: venueDetails.hours.display || '',
    popularity: venueDetails.popularity || '', //DETAILS
    price: selectedPrice, //DETAILS
    category: selectedCategories || [],
    features: selectedFeatures || [], 
    checkIns:[], //--> Whenever a user signs in, we add {user:_ , date:_,}, (this lets us to track check-ins/day & popular hours overtime)
    reviews: [],  //--> Whenever a user rates a venue, their rating (1-5) is added to the array. Get sum and divide by ratings.length for avg. 
    moments:[], //--> moments
    mapImage: `${mBoxBaseUrl}/dark-v11/static/pin-l+0000ff(${selectedVenue.geocodes.main.longitude},${selectedVenue.geocodes.main.latitude})/${selectedVenue.geocodes.main.longitude},${selectedVenue.geocodes.main.latitude},10,0,34/560x200@2x?access_token=${mBoxToken}`,
  };



  //-- Get the venue's hours for today
  function getVenueHours(venue) {
    const today = new Date().getDay();
    if (venue.hours && venue.hours[today]) {
      const formatTime = (time) => {
        const formattedTime = ('0' + time).slice(-4);
        const hours = formattedTime.slice(0, 2);
        const minutes = formattedTime.slice(2);
        return `${hours}:${minutes}`;
      };
      const open = formatTime(venue.hours[today].open);
      const close = formatTime(venue.hours[today].close);
      return open === "00:00" && close === "11:59" ? "24h" : `${open} - ${close}`;
    } else {
      return "N/A";
    }
  }


  const handleFieldChange = (field, value) => {
    if (field === 'description') {
      setVenueDescription(value);
    }
  };

  //-- price scale 
  const handleChangeDropdown = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setSelectedPrice(selectedValue);
  };
  
  //-- SAVE VENUE OBJECT in Firestore "venues" collection
  // async function addVenueToDb(id, venue) {
  //   setSavingVenue(true)
  //   try {
  //   const docRef = await addDoc(collection(db, "venues"), {
  //       venue
  //       });
  //       setTimeout(() => {
  //         setSavingVenue(false);
  //       }, 1200);
  //       console.log("Document written with ID: ", docRef.id);
  //   } catch (e) {
  //   console.error("Error adding document: ", e);
  //   setSavingVenue(false);
  //   }
  // }

  async function addVenueToDb(venue) {
    const {venueId, name, address, latitude, longitude, website, phone, description, hours, hoursDisplay, popularity, price, category, features, checkIns, reviews, mapImage, moments} = venue;
    setSavingVenue(true)
    try {
    const docRef = await setDoc(doc(db, "venuesOTT", venueId), {
      venueId: venueId,
      name: name, 
      address: address, 
      latitude: latitude,
      longitude: longitude,
      website: website || 'N/A',  
      phone: phone || 'N/A',
      description: venueDescription || description, 
      hours: hours, 
      hoursDisplay: hoursDisplay|| '',
      popularity: popularity || '', //DETAILS
      price: price,  //DETAILS
      category: category,
      features: features, 
      checkIns: checkIns,
      reviews: reviews,   
      mapImage: mapImage,
      moments: moments
      });
      setTimeout(() => {
        setSavingVenue(false);
      }, 1200);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
    console.error("Error adding document: ", e);
    setSavingVenue(false);
    }
  }




  return(
    <div className="venueDetails-card">

      <div className='map-img-container'>
        <img src={venue.mapImage} alt="Map Image" />
      </div>

      <div className='details_card-main-info'>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <h2 className='card-title'>{venue.name}</h2>
        </div>

        {/* Secondary info (address, hours etc.) */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <p className="secondaryTxt" >{venue.address}</p>
          <p className="secondaryTxt">{venue.phone}</p>
          {venue.website && (
            <a className='secondaryTxt' style={{ color: 'blue', padding:0, margin:0 }} href={venue.website} target="_blank" rel="noopener noreferrer">
              {venue.website.replace(/^https?:\/\//, '').split('/')[0]}
            </a> )}
        </div>

        <div style={{paddingTop:'.5rem'}}>
            <p className="secondaryTxt"> Today: {getVenueHours(venue)}</p>
          </div>

        
        <div style={{ borderBottom: '.5px solid gray', paddingTop: '1rem' }}></div>
        {/* VENUE DESCRIPTION BOX*/}
        <div>
          <h4 style={{ margin: '.5rem', marginLeft:'0' }}>Description</h4>
          <textarea style={{ width: '100%', minHeight: '5rem', backgroundColor: '#fff', color: 'black', borderRadius: '.15rem', borderColor:'#c0c0c0', borderWidth: '.01rem', fontFamily: 'inherit', padding:'.3rem', resize: 'none', }}
            value={venueDescription}
            onChange={(e) => handleFieldChange('description', e.target.value)}
          />
        </div>

        <div style={{display:'flex'}}>
          {/* VENUE CATEGORIES */}
          <div style={{display:'flex', flexDirection:"column"}}>
            <h4 style={{ margin: '.5rem', marginLeft:'0' }}>Category</h4>
            <div style={{display:'flex'}}>
              {venueCategories.map((cat, index) => (
                <button key={`cat-${index}`} 
                className={`chip ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                onClick={() => setSelectedCategories(cats => {
                  return cats.includes(cat) ? cats.filter(item => item !== cat) : [...cats, cat]
                })}> 
                  {cat} 
                </button> ))}
            </div>
          </div>

          {/* VENUE PRICE SCALE */}
          <div style={{display:'flex', flexDirection:"column", marginLeft:'1.5rem'}}>
            <h4 style={{ margin: '.5rem', marginLeft:'.5rem', marginBottom:'.5rem' }}>Price</h4>
            <select className='select' value={selectedPrice} onChange={handleChangeDropdown}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}> {value} </option>
              ))}
            </select>
          </div>
        </div>

        {/* VENUE FEATURES */}
        <h4 style={{ margin: '.5rem', marginLeft:'0' }}>Features</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap'}}>
          {venueFeatures.map((feat, index) => (
            <button key={`feat-${index}`}
              className={`chip ${selectedFeatures.includes(feat) ? 'selected' : ''}`}
              onClick={() => setSelectedFeatures(feats => {
                return feats.includes(feat) ? feats.filter(item => item !== feat) : [...feats, feat]
              })}
            >
              {feat}
            </button>
          ))}
        </div>

        {/* ADD TO DB */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding:'0rem'}}>
          <button className='btn-db' onClick={() => { 
            addVenueToDb(venue)
            }}>
            { savingVenue 
            ? 
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
            :
            'Add' }
          </button>
        </div>
      </div>
    </div>
  )}



//-- Prop validation
VenueDetailsCard.propTypes = {
  selectedVenue: PropTypes.shape({
    fsq_id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
    geocodes: PropTypes.shape({
      main: PropTypes.shape({ 
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    location: PropTypes.shape({
      formatted_address: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  venueDetails: PropTypes.shape({
    description: PropTypes.string,
    hours: PropTypes.shape({
      display: PropTypes.string,
      regular: PropTypes.array,
    }),
    hours_popular: PropTypes.array,
    popularity: PropTypes.number,
    price: PropTypes.number,
    ratings: PropTypes.arrayOf(PropTypes.number),
    website: PropTypes.string,
    tel: PropTypes.string,
  }).isRequired,
  //technically not required as this is info is pushed from the mobile app;
  dailyCheckIns: PropTypes.arrayOf(PropTypes.shape({
    user: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })),
};


