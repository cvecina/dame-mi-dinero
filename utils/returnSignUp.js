import validateEmail from './validateEmail';
import validatePassword from './validatePassword.js';
import compare2Passwords from './compare2Passwords.js';

const signUpOptions = {
    showName: false,
    showEmail: true,
    showPassword: true,
    showConfirmPassword: false,
    regex: "",
}

export default function returnSignUp(name, email, password, confirmPassword, regex, options = signUpOptions) {
    const { showName = false, showEmail = true, showPassword = true, showConfirmPassword = false } = options;
    let emit = { header: "signUp", data: { email: email, password: password, validate: true } };
    const validationOptionsArrayObjects = (showEmail, showPassword) => {
        if (showName && showEmail && showPassword && showConfirmPassword) {
            if (validateEmail(email) && validatePassword(password, regex) && compare2Passwords(password, confirmPassword)) {
                emit = { header: "signUp", data: { name: name, email: email, password: password, confirmPassword: confirmPassword, validate: true } };
            } else {
                emit = { header: "error", data: { error: "No tienes email, nombre o la contraseña no es correcta1", validate: false } };
            }
        } else if (showName && showEmail && showPassword) {
            if (validateEmail(email) && validatePassword(password, regex)) {
                emit = { header: "signUp", data: { email: email, password: password, validate: true } };
            } else {
                emit = { header: "error", data: { error: "No tienes email, nombre o la contraseña no es correcta", validate: false } };
            }
        } else if (showEmail && showPassword && showConfirmPassword) {
            if (validateEmail(email) && validatePassword(password, regex) && compare2Passwords(password, confirmPassword)) {
                emit = { header: "signUp", data: { email: email, password: password, confirmPassword: confirmPassword, validate: true } };
            } else {
                emit = {
                    header: "error", data: { error: "Revisa los campos, puede que las contraseñas no coincidan.", validate: false }
                };
            }
        } else if (showEmail && showPassword) {
            if (validateEmail(email) && validatePassword(password, regex)) {
                emit = { header: "signUp", data: { email: email, password: password, validate: true } };
            } else {
                emit = { header: "error", data: { error: "No tienes email o la contraseña no es correcta", validate: false } };
            }
        } else if (showEmail) {
            if (validateEmail(email)) {
                emit = { header: "signUp", data: { email: email, validate: true } };
            } else {
                emit = { header: "error", data: { error: "El campo email es obligatorio.", validate: false } };
            }
        }
        return emit;
    };

    const validationOption = validationOptionsArrayObjects(showEmail, showPassword);
    return validationOptionsArrayObjects(showEmail, showPassword);
}