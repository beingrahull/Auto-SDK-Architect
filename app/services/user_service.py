from app.models.user import User
from app.utils.security import compare_password



async def find_by_email(emailid:str):
    return await User.find_one(User.email==emailid)

async def authentication(email:str,password:str):
    check_user=await find_by_email(email)
    if not check_user:
        return None
    pass_validation=compare_password(password,check_user.password_hash)
    if not pass_validation:
        return None
    return check_user