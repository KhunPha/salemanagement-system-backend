import * as yup from "yup"

const firstname = yup
    .string()
    .required("Firstname is required.")
    .min(2, "Firstname sould have atleast 2 characters.")
    .max(21, "Firstname should have atmost 20 character");

const lastname = yup
    .string()
    .required("Lastname is required.")
    .min(2, "Lastname sould have atleast 2 characters.")
    .max(21, "Lastname should have atmost 20 character");

const username = yup
    .string()
    .required("Username is required.")
    .min(5, "Username sould have atleast 5 characters.")
    .max(21, "Username should have atmost 20 character");

const password = yup
    .string()
    .required("Password is required.")
    .min(8, "Password sould have atleast 8 characters.")

export const UserRegisterationRules = yup.object().shape({
    firstname,
    lastname,
    username,
    password,
})

export const UserLoginRules = yup.object().shape({
    username,
    password
})