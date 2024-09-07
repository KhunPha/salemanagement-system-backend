import UserLogSchema from "../model/user/userlog.model"

const TerminateCheck = async (context: any) => {
    const token = context.headers['authorization'].split(" ")[1]
    if (token) {
        const userTerminate = await UserLogSchema.findOne({token})
        if(userTerminate?.terminate)
            return true
        return false
    }
    return false
}

export default TerminateCheck