import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { BaseSelect } from "components/common";
// import { CancelToken } from "apisauce";
// import { MarketSaleApi } from "services/marketSale/marketSaleApi";
import { UserInfoApi } from "services/userInfo/userInfoApi";
import moment from "moment";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
    },
    y: {
      grid: {
        display: false,
        drawBorder: false,
      },
    },
  },
};

// interface Crypto {
//   currentPrice: number;
//   id: number;
//   name: string;
//   symbol: string;
// }

enum Period {
  ALLTIME = "All time",
  YEAR = "For year",
  MONTH = "For month",
}

// const source = CancelToken.source();

interface PriceChartProps {
  poolId: number;
}

export function PriceChart({ poolId }: PriceChartProps) {
  // const [cryptos, setCryptos] = useState<Crypto[] | null>(null);
  // const [selected, setSelected] = useState<Crypto | null>();
  // const [period, setPeriod] = useState<Period>(Period.YEAR);
  const [data, setData] = useState<ChartData<"line">>();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState();
  const [marketPools, setMarketPools] = useState<MarketWineRaw[] | undefined>([]);

  // const { marketPools, marketPoolsLoading } = useMarketSale({});

  // TODO: change api endpoint for chart data
  useEffect(() => {
    UserInfoApi.getPurchased({
      body: {
        onPage: 100,
        pageNumber: 1,
        filters: {},
        nickname: "admin@admin.com",
      },
    })
      .then((response) => {
        console.log(response);
        setMarketPools(response.response?.records);
      })
      .catch((error) => {
        console.error(error);
        setError(true);
      });
    setLoading(false);
    // MarketSaleApi.getMarketSale({ body: {} })
    //   .then((response) => {
    //     console.log(response);
    //     setMarketPools(response.response?.records);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     setError(true);
    //   });
  }, [range]);

  useEffect(() => {
    console.log(poolId);
    // crutch
    const recordsFromPoolId = marketPools?.filter((item) => item.winePool.poolId === poolId);
    console.log(recordsFromPoolId);
    if (!recordsFromPoolId || recordsFromPoolId?.length === 0) {
      // setError(true);
      return;
    }
    // take "FirstSalePrice" - is 1 point
    // const firstPoint = Number(recordsFromPoolId[0].winePool.wineParams.FirstSalePrice);
    // take "price" from other found pools - is other points
    const otherPoints: number[] = [];
    // let accumulator: number[] = [];
    const chartData: any = {};
    // let prev = "";
    recordsFromPoolId
      .sort((a, b) => {
        if (a.date_at < b.date_at) {
          return -1;
        } else if (b.date_at < a.date_at) {
          return 1;
        } else {
          return 0;
        }
      })
      .forEach((item) => {
        const date = moment.unix(item.date_at).format(range === Period.YEAR ? "MM-YYYY" : "DD-MM");
        if (!chartData[date]) {
          chartData[date] = {
            total: 0,
            count: 0,
          };
        }
        chartData[date].total += Number(item.price);
        chartData[date].count += 1;
        // if (moment.unix(item.date_at).format(range === Period.YEAR ? "MM" : "DD") !== prev) {
        //   otherPoints.push(
        //     accumulator.reduce(function (sum, elem) {
        //       return sum + elem;
        //     }, 0) / accumulator.length,
        //   );
        //   accumulator = [];
        // } else {
        //   accumulator.push(Number(item.price));
        // }
        // prev = moment.unix(item.date_at).format(range === Period.YEAR ? "MM-YYYY" : "DD-MM");
      });
    const chartLabels = [];
    console.log(chartData);
    Object.keys(chartData).forEach((key) => {
      chartLabels.push(key);
      otherPoints.push(chartData[key].total / chartData[key].count);
    });
    console.log(otherPoints);
    const labels = Array.from(
      new Set(
        recordsFromPoolId
          .sort((a, b) => {
            if (a.date_at < b.date_at) {
              return -1;
            } else if (b.date_at < a.date_at) {
              return 1;
            } else {
              return 0;
            }
          })
          .map(({ date_at }) => {
            return moment.unix(date_at).format(range === Period.YEAR ? "MM-YYYY" : "DD-MM");
          }),
      ),
    );

    // update data from response
    //TODO: fix bezue (tension)
    //TODO: fix the values of the borders of the chart axes (for example: 0.990000000)
    setData({
      labels: labels,
      datasets: [
        {
          data: [...otherPoints],
          tension: 0.3,
          borderWidth: 1.5,
          label: "$",
          borderColor: "#FF4A3D",
          backgroundColor: "#FF4A3D",
        },
        // {
        //   data: [44, 42, 39, 47, 51, 47, 49],
        //   borderDash: [10, 5],
        //   tension: 0.5,
        //   borderWidth: 1.5,
        //   label: "$",
        //   borderColor: "#B1BAD1",
        //   backgroundColor: "#B1BAD1",
        // },
      ],
    });
  }, [marketPools]);

  return (
    <>
      <div className="mb-3 d-flex justify-content-end">
        <BaseSelect
          className=""
          options={[
            { label: Period.ALLTIME, value: Period.ALLTIME },
            { label: Period.YEAR, value: Period.YEAR },
            { label: Period.MONTH, value: Period.MONTH },
            // { label: Period.DAY, value: Period.DAY },
          ]}
          onOptionChange={({ value }) => {
            // setPeriod(value);
            setRange(value);
          }}
        />
      </div>

      {loading ? (
        "Loading chart..."
      ) : error ? (
        "Error to load chart"
      ) : data ? (
        <Line options={options} data={data} />
      ) : (
        <>
          <div
            style={{
              position: "relative",
            }}
          >
            <div
              style={{
                // position: "absolute",
                filter: "blur(5px)",
                zIndex: -1,
              }}
            >
              <Line
                options={options}
                data={{
                  labels: ["10-07", "15-07", "22-08", "11-09", "12-09", "15-09", "27-10"],
                  datasets: [
                    {
                      data: [32, 36, 35, 36, 38, 39, 40],
                      tension: 0.3,
                      borderWidth: 1.5,
                      label: "$",
                      borderColor: "#FF4A3D",
                      backgroundColor: "#FF4A3D",
                    },
                  ],
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                padding: "20px",
                borderRadius: "5px",
                zIndex: 10,
              }}
            >
              <h2>no sales data yet</h2>
            </div>
          </div>
        </>
      )}
    </>
  );
}
