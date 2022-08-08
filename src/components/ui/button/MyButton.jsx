import React from 'react';
import { motion } from 'framer-motion';

const MyButton = ({ title, bgColor, textColor, width, onClick, type, disabled }) => {
  return (
    <motion.button
      disabled={disabled}
      className={`${bgColor} ${textColor} ${width} rounded-[25px] px-3 py-2 text-[16px] font-[500] tracking-wide disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300`}
      whileHover={!disabled && {
        scale: 1.1,
        opacity: 0.8,
      }}
      whileTap={!disabled && {
        scale: 1.1,
      }}
      onClick={onClick}
      type={type ?? 'submit'}
    >
      {title}
    </motion.button>
  );
};

export default MyButton;
