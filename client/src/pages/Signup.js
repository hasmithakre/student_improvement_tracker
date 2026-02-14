import React, { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/auth/signup", formData);
    alert("Signup successful");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>

      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

      <select name="role" onChange={handleChange}>
        <option value="student">Student</option>
        <option value="mentor">Mentor</option>
      </select>

      <button type="submit">Signup</button>
    </form>
  );
};

export default Signup;
