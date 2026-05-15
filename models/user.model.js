const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating a user"],
        trim:true,
        lowercase:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Invalid Email Address"
        ],
        unique:[true,"Email Already Exists"]
    },
    name:{
        type: String,
        required: [true,"Name is required for creating a new account"]
    },
    password:{
        type: String,
        required:[true,"Password id required for creating a new password"],
        minlength:[6,"password should contain more then 6 characters"],
        select: false
    },
   systemUser:{
        type: Boolean,
        default: false,
        // immutable true iskay liye kiya hai kyuki koi bhi system user ko programtically change nahi kar 
        // sakta jis kay pass db ka access hai wohi khali system user create kar sakta hai 
        immutable: true,
        select: false
   }
   
},{
    timestamps: true
})

userSchema.pre("save",async function(next){

    // This Will Check That Whether the User has Modified their password we need to hash that password again 

    if(!this.isModified("password")){
        return
    }
     
    const hash =  await bcrypt.hash(this.password, 10)
    this.password = hash

    return 
})

// This Method is will compare the currently enterd password and compare it with original passsword 
// This is Just a Reusable Function which will compare the password during login 

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel