export const ADMIN_CONFIG = {
  username: 'Himanshu Verma',
  email: 'himanshu.verma73808@gmail.com',
  password: 'TP@4262cma',
  role: 'Super Administrator',
};

export const checkIsAdmin = (customerName?: string | null, email?: string | null): boolean => {
  const mail = (email || '').trim().toLowerCase();
  const name = (customerName || '').trim().toLowerCase();

  if (
    mail === ADMIN_CONFIG.email.toLowerCase() ||
    mail === 'admin@magadhtyres.com' ||
    (mail === '' && (
      name === ADMIN_CONFIG.username.toLowerCase() ||
      name === 'himanshu.verma73808' ||
      name === 'himanshuverma' ||
      name === 'magadhtyres'
    ))
  ) {
    return true;
  }

  return false;
};

