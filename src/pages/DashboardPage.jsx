import { useState } from 'react';
import { VscSearch,  } from "react-icons/vsc";

// ******************* MAPBOX MAPS + FOURSQUARE PLACE SEARCH ********************************************************* 
// USING A COMBINATION OF MAPBOX (for maps) AND FOURSQUARE (for place + place details);
// PLACE SEARCH API --> https://location.foursquare.com/developer/reference/place-search
// DETAILS SEARCH API --> https://location.foursquare.com/developer/reference/place-details
// DETAILS FIELDS --> https://location.foursquare.com/developer/reference/response-fields 

export default function Dashboard(){
  const [textInput, setTextInput] = useState(''); //user input

  function handleSubmit() {
  }


  return (
    <>
      {/* HEADER */}
      <div className="header">
        <div className="searchBar-container">
          <input className='searchBar'type="text" placeholder="Search" 
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button className='searchBar-Btn' onClick={() => handleSubmit()}>
            <VscSearch fontSize={19}/>
          </button>
        </div>
        <div>
          <button className='signOut-btn' onClick={() => handleSubmit()}> Sign Out </button>
        </div>
      </div>
      

      <div className="main-content">
      {/* SIDEBAR */}
      <div className="sidebar-container">
        <div className="sidebar">
          <ul>
            <li>Place 1</li>
            <li>Place 2</li>
          </ul>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="venueDetails-container">
        <div className='venueDetails-card'>
        </div>
      </div>

    </div>
    </>
  );
}