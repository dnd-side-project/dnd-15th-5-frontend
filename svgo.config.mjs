export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: {
            preservePrefixes: ['map-pin-'],
          },
          convertPathData: {
            floatPrecision: 3,
          },
        },
      },
    },
  ],
};
