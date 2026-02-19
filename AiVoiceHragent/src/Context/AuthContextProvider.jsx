import { createContext, useContext, useState } from "react";

// import { createContext, useContext } from "react";

const AuthContext = createContext()


export  const AuthContextProvider=({children})=>{
    
    const [user,setUser] = useState(null)
 
    
   return(
    <div>
         <AuthContext.Provider   value={{user,setUser}}  >
        {children}

    </AuthContext.Provider>

    </div>
   )

}

 export const useAuth=()=> useContext(AuthContext)



// const AuthContext = createContext({
//     user: null,
//     setUser: () => {}
// })


// export const AuthContextProvider = AuthContext.Provider

// export const useAuth = () => useContext(AuthContext)
