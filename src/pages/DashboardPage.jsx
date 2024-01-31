import { useState } from 'react';
import { VscSearch,  } from "react-icons/vsc";
import VenueDetailsCard from '../components/VenueDetailsCard';
import CustomEntryCard from '../components/CustomEntryCard';
import { useNavigate } from 'react-router-dom';
const fsBaseUrl = import.meta.env.VITE_FS_BASE_URL;
const fsKey = import.meta.env.VITE_FS_API_KEY;



export default function Dashboard(){
  const [textInput, setTextInput] = useState(''); //user input
  const [searched, setSearched] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState([]); //Venues returned from places search api
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueDetails, setVenueDetails] = useState(null);


  function handleSubmit() {
    setSearched(true);
    setLoading(true);
    fetchFourSq(placesUrl, 'places')
    setLoading(false);
  }


  //-- FourSquare Places Search params    
  let userLat = 45.4215;
  let userLng = -75.6993;
  let sessionToken = generateRandomSessionToken();
  let limit = 10;
  let categoryIds = ['10032', '13003', '10032', '13000', '13062', '13065', '13018'] //https://location.foursquare.com/places/docs/categories
  let placesUrl = `${fsBaseUrl}search?query=${textInput}&ll=${userLat},${userLng}&radius=50000&categories=${categoryIds.join(",")}&limit=${limit}&session_token=${sessionToken}`
  const navigate = useNavigate();


  //-- FourSquare place details request fields
  let detailFields = ['description', 'tel', 'website', 'social_media', 'hours', 'hours_popular', 'rating', 'stats', 'popularity', 'price', 'photos', 'features'];


  //-- Generate session Token for FourSquare API
  function generateRandomSessionToken(length = 32) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  }


   //-- Request headers for FourSquare API
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: fsKey
    }
  };

//-- Fetch FourSquare
  function fetchFourSq(url, reqType){
    fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    }).then(response => {
      reqType === 'places' ? setVenues(response.results) : setVenueDetails(response);
    })
    .catch(e => console.error(e));
  }


// -- Place list item component
const buildPlacesLi = (places) => {
  if (!searched) {
    return (
      <li className="no-results">
        <p>Search for a venue</p>
      </li>
    )
  }
  if (places.length === 0) {
    return (
      <li className="no-results">
        <p>No results found</p>
      </li>
    );
  } else {
      return (
        <>
          {loading && (
            <li className="loading">
              <p>Searching...</p>
            </li>
          )}
          {places.map((venue) => (
            <li key={venue.fsq_id} className={`place-li ${selectedVenue === venue ? 'clicked' : ''}`} onClick={() => getDetails(venue)}>
              <p className='place-name'>{venue.name}</p>
              <p className='place-address'>{venue.location['formatted_address']}</p>
            </li>
          ))}
        </>
      );
    }
  };


  //fetch details api --> render details card
    const getDetails = (venue) => {
      setSelectedVenue(venue);
      let placeDetailsUrl = `${fsBaseUrl}${venue.fsq_id}?fields=${detailFields.join(',')}&session_token=${sessionToken}`;
      fetchFourSq(placeDetailsUrl, 'details');
    }

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <div className="searchBar-container">
          <input className='searchBar'type="text" placeholder="Search" 
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' ? handleSubmit() : null}
          />
          <button className='searchBar-Btn' onClick={() => handleSubmit()}>
            <VscSearch fontSize={19}/>
          </button>
        </div>
        <div>
          <button className='signOut-btn' onClick={() => navigate(`/`)}> Sign Out </button>
        </div>
      </div>
      

      <div className="main-content">
      {/* SIDEBAR */}
      <div className="sidebar-container">
        <div className="sidebar">
          <ul className="venues-ul">
            {buildPlacesLi(venues)}
          </ul>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="venueDetails-container">
        {venueDetails ? 
        <VenueDetailsCard selectedVenue={selectedVenue} venueDetails={venueDetails}/> 
        : 
        <CustomEntryCard />}
      </div>

    </div>
    </>
  );
}