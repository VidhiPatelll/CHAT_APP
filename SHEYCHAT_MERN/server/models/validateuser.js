const Joi = require("joi");

function validateUser(user) {
  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(15).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    password: Joi.string()
      .default(null)
      .min(8)
      .max(18)
      .external((value) => {
        if (
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,12}$/.test(
            value
          )
        ) {
          return value;
        } else {
          throw Error(
            "Please enter valid password: at least one uppercase letter, one lowercase letter, one number and one special character"
          );
        }
      }),
  });
  return joiSchema.validateAsync(user);
}
module.exports = { validateUser };
