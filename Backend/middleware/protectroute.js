const protectRoute = (req, res, next) => {
  try {
    const token =  req.cookies.token
  if(!token){
   return res.status(401).json({
      message: "Unauthorized user"
    })
  }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user=decoded
      next()
    
  } catch (error) {
    res.clearCookie("token")
    res.status(500).json({
      message: "Internal server error"
    })
    
  }



}