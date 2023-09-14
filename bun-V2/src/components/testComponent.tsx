import { useState } from 'react';

export default function TestComponent({ message }: { message: string }) {
  const [state, setState] = useState(0);

  // <button onClick={() => console.log('Is this a working component?')}>INCREMENT</button>
  return (
    <div>
      <h1>Hello {message}</h1>
      <h1>Counter: {state}</h1>
      <button onClick={() => setState(state + 1)}>INCREMENT</button>
    </div>
  )
}
