const getNavigatorLanguage = () =>
  navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.userLanguage ||
    navigator.language ||
    navigator.browserLanguage ||
    "en"; 


export default getNavigatorLanguage 




