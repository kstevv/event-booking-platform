import CreateEventButton from '../../components/CreateEventButton';
import type { Tokens } from '../../types'; // adjust the path if needed

export default function CalendarPage() {
  const tokens = {
    access_token: 'xxx',
    refresh_token: 'yyy',
    scope: 'https://www.googleapis.com/auth/calendar',
    token_type: 'Bearer',
    expiry_date: 9999999999999,
  };

  // ✅ Destructure and map to expected interface
  const { access_token, refresh_token, expiry_date } = tokens;

  const mappedTokens: Tokens = {
    accessToken: access_token!,
    refreshToken: refresh_token!,
    expiryDate: expiry_date!,
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Create a Google Calendar Event</h1>
      <CreateEventButton tokens={mappedTokens} />
    </div>
  );
}
