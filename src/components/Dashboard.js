import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardText,
  Button,
  Input,
  Form,
  FormGroup,
  CardImg,
  InputGroup,
  Spinner,
  CardBody,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
} from "wagmi";
import {
  contractData,
  fromWeiToDecimals,
  toWeiToDecimals,
} from "../utils/web3-utils";
import { getQueryVariable } from "../utils/utils";
import { formatEther } from "viem";

export default function Dashboard() {
  const { address } = useAccount();

  const { data: balance, loading } = useContractRead({
    abi: contractData?.usdtABI,
    address: contractData?.usdtAddress,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const { data: investorData } = useContractRead({
    abi: contractData?.luminaiStakingABI,
    address: contractData?.luminaiStakingAddress,
    functionName: "investors",
    args: [address],
    select: (data) => ({
      user: data[0],
      totalStaked: fromWeiToDecimals(data[1]?.toString() || 0, 6),
      totalClaimed: fromWeiToDecimals(data[2]?.toString() || 0, 6),
      startDate: Number(data[3]) * 1000,
      totalReferral: fromWeiToDecimals(data[4]?.toString() || 0, 6),
      referrer: data[5]?.toString(),
    }),
    watch: true,
  });

  const { data: totalReward } = useContractRead({
    abi: contractData?.luminaiStakingABI,
    address: contractData?.luminaiStakingAddress,
    functionName: "calculateTotalReward",
    args: [address],
    watch: true,
  });

  const { data: airdropClaimFee } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "AIRDROP_CLAIM_FEE",
    args: [],
    watch: true,
  });

  const { data: airdropClaimed } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "airdropAmount",
    args: [address],
    watch: true,
    select: (data) => data?.toString(),
  });

  const { data: airdropAmountClaimed } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "airdropClaimedAmount",
    args: [address],
    watch: true,
    select: (data) => {
      const amountInEth = formatEther(data);
      return amountInEth;
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const { chain, chains } = useNetwork();

  const [stakeValue, setStakeValue] = useState(10);
  const [packageData, setPackageData] = useState({
    min: 10,
    apy: 90,
    days: 90,
  });
  const [activeCard, setActiveCard] = useState(10);

  const handlePackageClick = (min, apy, days) => {
    setPackageData({ min, apy, days });
    setStakeValue(min);
    setActiveCard(min);
  };

  // const handleStakeChange = (e) => {
  //   // const inputValue = parseFloat(e.target.value);
  //   // if (packageData && inputValue < packageData.min) {
  //   //   setStakeValue(packageData.min);
  //   // } else {
  //   //   setStakeValue(e.target.value);
  //   // }

  // };

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    abi: contractData?.usdtABI,
    address: contractData?.usdtAddress,
    functionName: "allowance",
    args: [address, contractData?.luminaiStakingAddress],
    watch: true,
  });

  const { writeAsync: approve, isLoading: isApproveLoading } = useContractWrite(
    {
      abi: contractData?.usdtABI,
      address: contractData?.usdtAddress,
      functionName: "approve",
      args: [
        contractData?.luminaiStakingAddress,
        toWeiToDecimals(stakeValue, 6),
      ],
      onError(error) {
        console.log("Error", error);
      },
    }
  );

  const { writeAsync: stakeAmount, isLoading: isStakeLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABI,
      address: contractData?.luminaiStakingAddress,
      functionName: "stakeAmount",
      args: [
        toWeiToDecimals(stakeValue, 6),
        getQueryVariable("ref") || "0x0000000000000000000000000000000000000000",
      ],
      onError(error) {
        console.log("Error", error);
      },
    });

  const { writeAsync: claimReward, isLoading: isClaimRewardLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABI,
      address: contractData?.luminaiStakingAddress,
      functionName: "claimTotalReward",
      args: [],
    });

  const { writeAsync: claimAirdrop, isLoading: isClaimAirdropLoading } =
    useContractWrite({
      abi: contractData?.luminaiAirdropABI,
      address: contractData?.luminaiAirdropAddress,
      functionName: "claimAirdrop",
      args: [
        getQueryVariable("ref") || "0x0000000000000000000000000000000000000000",
      ],
      value: airdropClaimFee?.toString(),
      onError(error) {
        console.log("Error", error);
      },
    });

  return (
    <Container id="dashboard">
      <h1 className="main-head">Staking Dashboard</h1>
      <Row>
        <Col xs="12" md="12" lg="5" className="mb-5 order-2 order-lg-1 ">
          {/* <div className="scrollable-cards"> */}
          <Card body className="card1 mb-3">
            <Row>
              <Col xs="12">
                <CardTitle tag="h5">Staking Rewards</CardTitle>
              </Col>
              {/* <Col xs="4">
                  <Row>
                    <CardText>Total Rewards:</CardText>
                  </Row>
                  <Row>
                    <Col>
                      <CardText className="text-right red">452542</CardText>
                    </Col>
                    <Col>
                      <CardImg src={vector1} height="14px" />
                    </Col>
                  </Row>
                </Col> */}
            </Row>
            <Row>
              <Col>
                <CardImg />
              </Col>
            </Row>
            <CardText>
              <Row>
                <Col className="cardHead">
                  {fromWeiToDecimals(totalReward?.toString() || 0, 6)}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    color="primary"
                    className="button"
                    block
                    disabled={isClaimRewardLoading}
                    onClick={() => claimReward()}
                  >
                    {isClaimRewardLoading && (
                      <Spinner size="sm" color="light" />
                    )}
                    Claim All
                  </Button>
                </Col>
              </Row>
            </CardText>
          </Card>

          <Card body className="card2 mb-3">
            <Row>
              <Col xs="8">
                <CardTitle tag="h5">Airdrop Rewards</CardTitle>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardImg />
              </Col>
            </Row>
            <CardText>
              <Row>
                <Col className="cardHead">{airdropAmountClaimed || 0}</Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    color="secondary"
                    className="button"
                    disabled={isClaimAirdropLoading}
                    block
                    onClick={() => claimAirdrop()}
                  >
                    {isClaimAirdropLoading && (
                      <Spinner size="sm" color="light" />
                    )}
                    Claim Airdrop
                  </Button>
                </Col>
              </Row>
            </CardText>
          </Card>

          <Card body className="card4">
            <Row>
              <Col xs="8">
                <CardTitle tag="h5">Referral Rewards</CardTitle>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardImg />
              </Col>
            </Row>
            <CardText>
              <Row>
                <Col className="cardHead">{airdropClaimed || 0}</Col>
              </Row>
            </CardText>
          </Card>

          {/* <Card body className="card2 mb-5">
              <Row>
                <Col xs="8">
                  <CardTitle tag="h5">You Stakes</CardTitle>
                </Col>
                <Col xs="4">
                  <Row>
                    <CardText>Stake Price:</CardText>
                  </Row>
                  <Row>
                    <Col>
                      <CardText className="text-right green">0.56%</CardText>
                    </Col>
                    <Col>
                      <CardImg src={vector2} height="14px" />
                    </Col>
                  </Row>{" "}
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">0.00</Col>
                </Row>
                <Row>
                  <Col xs="8" className="gray">
                    12% apy locked for 365 days And after 365 days 112% apy
                  </Col>
                  <Col xs="4">
                    <Button color="secondary">Withdraw</Button>
                  </Col>
                </Row>
              </CardText>
            </Card>

            <Card body className="card1 mb-5">
              <Row>
                <Col xs="8">
                  <CardTitle tag="h5">Rewards</CardTitle>
                </Col>
                <Col xs="4">
                  <Row>
                    <CardText>Total Rewards:</CardText>
                  </Row>
                  <Row>
                    <Col>
                      <CardText className="text-right red">452542</CardText>
                    </Col>
                    <Col>
                      <CardImg src={vector1} height="14px" />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">0.00</Col>
                </Row>
                <Row>
                  <Col xs="8" className="gray">
                    All your rewards will be shown here on this portal
                  </Col>
                  <Col xs="4">
                    <Button color="primary" className="button">
                      Claim All
                    </Button>
                  </Col>
                </Row>
              </CardText>
            </Card>

            <Card body className="card2 mb-5">
              <Row>
                <Col xs="8">
                  <CardTitle tag="h5">You Stakes</CardTitle>
                </Col>
                <Col xs="4">
                  <Row>
                    <CardText>Stake Price:</CardText>
                  </Row>
                  <Row>
                    <Col>
                      <CardText className="text-right green">0.56%</CardText>
                    </Col>
                    <Col>
                      <CardImg src={vector2} height="14px" />
                    </Col>
                  </Row>{" "}
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">0.00</Col>
                </Row>
                <Row>
                  <Col xs="8" className="gray">
                    12% apy locked for 365 days And after 365 days 112% apy
                  </Col>
                  <Col xs="4">
                    <Button color="secondary">Withdraw</Button>
                  </Col>
                </Row>
              </CardText>
            </Card> */}
          {/* </div> */}
        </Col>

        <Col xs="12" md="12" lg="7" className="mb-5 order-1 order-lg-2">
          <Card body className="card3 form">
            {/* <Card> */}
            <Row className="mt-4">
              <Col md="4">
                <Card
                  onClick={() => handlePackageClick(10, 90, 90)}
                  className={`package-card mb-2 h-75 text-center ${
                    activeCard === 10 ? "active" : ""
                  }`}
                >
                  <CardTitle>PACKAGE ONE</CardTitle>
                  <CardBody>90-days dailyEarn 1%</CardBody>
                </Card>
                <Col className="gray min-dep">minimum deposit 10$-5000$</Col>
              </Col>
              <Col md="4">
                <Card
                  onClick={() => handlePackageClick(5001, 120, 120)}
                  className={`package-card mb-2 h-75 text-center ${
                    activeCard === 5001 ? "active" : ""
                  }`}
                >
                  <CardTitle>PACKAGE TWO</CardTitle>
                  <CardBody>120-days dailyEarn 1%</CardBody>
                </Card>
                <Col className="gray min-dep">minimum deposit 5001$-15000$</Col>
              </Col>
              <Col md="4">
                <Card
                  onClick={() => handlePackageClick(15001, 150, 150)}
                  className={`package-card mb-2 h-75 text-center ${
                    activeCard === 15001 ? "active" : ""
                  }`}
                >
                  <CardTitle>PACKAGE THREE</CardTitle>
                  <CardBody>150-days dailyEarn 1%</CardBody>
                </Card>
                <Col className="gray min-dep">minimum deposit 15001$</Col>
              </Col>
            </Row>
            {/* </Card> */}
            <Form>
              <FormGroup className="mt-5">
                <Row>
                  <Col xs="8">Enter Amount</Col>
                  <Col>
                    Balance:{" "}
                    {!loading ? fromWeiToDecimals(balance || 0, 6) : "0"}{" "}
                    <span className="spn">USDT</span>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup className="mb-5">
                <Row>
                  <Col>
                    <InputGroup>
                      <Input
                        type="number"
                        placeholder={stakeValue}
                        value={stakeValue}
                        onChange={(e) => {
                          setStakeValue(e.target.value);
                          if (e?.target?.value <= 5000) {
                            setPackageData({ min: 10, apy: 90, days: 90 });
                            setActiveCard(10);
                          } else if (e?.target?.value <= 15000) {
                            setPackageData({ min: 5001, apy: 120, days: 120 });
                            setActiveCard(5001);
                          } else {
                            setPackageData({ min: 15001, apy: 150, days: 150 });
                            setActiveCard(15001);
                          }
                        }}
                        //   (e) => {
                        //   setStakeValue(e.target.value);
                        //   const packageValue = getPackageData(e.target.value);
                        //   console.log(packageValue);
                        //   setPackageData(packageValue);
                        // }
                        // }
                        className="custom-input"
                      />
                      <span className="input-group-text">USDT</span>
                    </InputGroup>
                    <Col xs="12" className="gray">
                      {packageData?.apy}% locked for {packageData?.days} days
                    </Col>
                  </Col>
                </Row>
              </FormGroup>
              <Container className="text-center">
                <FormGroup>
                  <Row>
                    <Col>
                      Total Token Staked :
                      <span className="spn">
                        {" "}
                        {investorData?.totalStaked} USDT
                      </span>
                    </Col>
                  </Row>
                </FormGroup>
                <FormGroup className="mb-5">
                  <Row>
                    <Col>
                      <Button
                        color="primary"
                        className="button form-button"
                        onClick={() => {
                          console.log(
                            allowance,
                            fromWeiToDecimals(allowance || 0, 6)
                          );
                          if (
                            fromWeiToDecimals(allowance || 0, 6) <
                            Number(stakeValue)
                          ) {
                            approve().then(() => refetchAllowance());
                          } else {
                            stakeAmount().then(() => setStakeValue(0));
                          }
                        }}
                        disabled={
                          stakeValue === "0" ||
                          stakeValue === "" ||
                          isStakeLoading ||
                          isApproveLoading ||
                          Number(stakeValue) >
                            Number(fromWeiToDecimals(balance || 0, 6)) ||
                          Number(stakeValue) < 10
                        }
                      >
                        {(isStakeLoading || isApproveLoading) && (
                          <Spinner size="sm" color="light" className="mr-2" />
                        )}
                        {fromWeiToDecimals(allowance || 0, 6) <
                        Number(stakeValue)
                          ? "Approve"
                          : "Stake"}
                      </Button>
                      <Button
                        className="button form-button my-3"
                        disabled={!address}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}?ref=${address}`
                          );
                        }}
                      >
                        Copy Referral Link
                      </Button>
                      {address && (
                        <div>{`${window.location.origin}?ref=${address}`}</div>
                      )}
                    </Col>
                  </Row>
                </FormGroup>
              </Container>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
