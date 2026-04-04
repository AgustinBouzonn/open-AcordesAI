import app from './app';
import { PORT } from './env';

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
