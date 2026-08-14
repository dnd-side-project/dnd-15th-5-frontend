export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          convertPathData: {
            floatPrecision: 3,
          },
        },
      },
    },
  ],
};
