import TestComponent from '../components/testComponent';
import { Layout } from '../Layout';

// export default function () {
//   return (
//     <div>
//       <TestComponent message='from pages/home' />
//     </div>
//   )
// }

export default function () {
  return (
    <Layout title='HOME PAGE'>
      <div>
        <TestComponent message='from pages/home' />
      </div>
    </Layout>
  )
}

